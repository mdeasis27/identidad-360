// Síntesis LLM — combina señales de Truora + Tavily en perfil 360°

import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import type { TruoraProfile } from "./truora";
import type { TavilySignal } from "./tavily";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
});

export interface Profile360 {
  risk_score: number; // 0-100
  risk_level: "bajo" | "medio" | "alto";
  summary: string;
  red_flags: string[];
  positive_signals: string[];
  sources: { title: string; url: string }[];
}

const schema = z.object({
  risk_score: z.number().min(0).max(100),
  risk_level: z.enum(["bajo", "medio", "alto"]),
  summary: z.string(),
  red_flags: z.array(z.string()),
  positive_signals: z.array(z.string()),
});

export async function buildProfile360(params: {
  name: string;
  truora: TruoraProfile;
  tavily: TavilySignal[];
}): Promise<Profile360> {
  const webEvidence = params.tavily
    .map((s) => `[${s.title}] ${s.content}`)
    .join("\n\n");

  const prompt = `Eres un analista experto en riesgo crediticio. Tu tarea es construir un perfil 360° de la persona "${params.name}" para apoyar una decisión de crédito.

VALIDACIÓN DE IDENTIDAD (Truora):
- Identidad confirmada: ${params.truora.identity_confirmed ? "SÍ" : "NO"}
- Listas de sanciones: ${params.truora.sanctions_hit ? "POSITIVO — alerta mayor" : "Limpio"}
- PEP (Persona Expuesta Políticamente): ${params.truora.pep_hit ? "SÍ — requiere debida diligencia" : "NO"}
- Registros judiciales: ${params.truora.judicial_records ? "SÍ — revisar detalle" : "Sin registros"}

SEÑALES WEB (búsqueda pública):
${webEvidence || "Sin resultados de búsqueda web disponibles."}

Con base en la evidencia anterior, genera un perfil de riesgo crediticio. El risk_score debe ser un número entre 0 (sin riesgo) y 100 (riesgo máximo). El risk_level debe ser "bajo" (0-33), "medio" (34-66) o "alto" (67-100). El summary debe ser un párrafo ejecutivo de 2-3 oraciones. red_flags son alertas concretas encontradas (puede ser vacío si no hay). positive_signals son indicadores favorables encontrados.`;

  const { object } = await generateObject({
    model: openrouter("meta-llama/llama-3.1-8b-instruct:free"),
    schema,
    prompt,
  });

  const sources = params.tavily.map((s) => ({ title: s.title, url: s.url }));

  return {
    ...object,
    sources,
  };
}
