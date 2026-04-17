// Síntesis LLM — combina señales de Truora + Tavily en perfil 360°

import { z } from "zod";
import { chat } from "@/ai-kit/router";
import type { UserApiKey } from "@/ai-kit/types";
import type { TruoraProfile } from "./truora";
import type { TavilySignal } from "./tavily";

export interface Profile360 {
  risk_score: number; // 0-100
  risk_level: "bajo" | "medio" | "alto";
  summary: string;
  red_flags: string[];
  positive_signals: string[];
  sources: { title: string; url: string }[];
  provider?: string;
  model?: string;
  latency_ms?: number;
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
  userApiKey?: UserApiKey;
}): Promise<Profile360> {
  const webEvidence = params.tavily
    .map((s) => `[${s.title}] ${s.content}`)
    .join("\n\n");

  const response = await chat({
    messages: [
      {
        role: "system",
        content:
          "Eres un analista experto en riesgo crediticio. Responde ÚNICAMENTE con un objeto JSON válido, sin markdown, sin explicaciones, sin texto adicional.",
      },
      {
        role: "user",
        content: `El JSON debe tener exactamente estas claves:
- risk_score: número entre 0 (sin riesgo) y 100 (riesgo máximo)
- risk_level: exactamente "bajo" (0-33), "medio" (34-66) o "alto" (67-100)
- summary: párrafo ejecutivo de 2-3 oraciones
- red_flags: array de strings con alertas concretas (vacío si no hay)
- positive_signals: array de strings con indicadores favorables

Datos de entrada para "${params.name}":

VALIDACIÓN DE IDENTIDAD (Truora):
- Identidad confirmada: ${params.truora.identity_confirmed ? "SÍ" : "NO"}
- Listas de sanciones: ${params.truora.sanctions_hit ? "POSITIVO — alerta mayor" : "Limpio"}
- PEP: ${params.truora.pep_hit ? "SÍ — requiere debida diligencia" : "NO"}
- Registros judiciales: ${params.truora.judicial_records ? "SÍ — revisar detalle" : "Sin registros"}

SEÑALES WEB (búsqueda pública):
${webEvidence || "Sin resultados de búsqueda web disponibles."}`,
      },
    ],
    maxTokens: 1024,
    userApiKey: params.userApiKey,
  });

  const jsonMatch = response.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("El modelo no devolvió JSON válido");

  const parsed = JSON.parse(jsonMatch[0]);
  const object = schema.parse(parsed);
  const sources = params.tavily.map((s) => ({ title: s.title, url: s.url }));

  return {
    ...object,
    sources,
    provider: response.provider,
    model: response.model,
    latency_ms: response.latency_ms,
  };
}
