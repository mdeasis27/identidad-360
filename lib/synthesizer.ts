// Síntesis LLM — combina señales de Truora + Tavily en perfil 360°

import { z } from "zod";
import type { TruoraProfile } from "./truora";
import type { TavilySignal } from "./tavily";

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

const MODELS = [
  "google/gemma-3-12b-it:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
  "qwen/qwen3-8b:free",
  "google/gemma-3-4b-it:free",
];

async function callOpenRouter(prompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY no configurada");

  let lastError: string = "Sin modelos disponibles";

  for (const model of MODELS) {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (res.status === 429) {
      lastError = `${model} — rate limited`;
      continue;
    }
    if (!res.ok) {
      const body = await res.text();
      lastError = `${model} — ${res.status}: ${body}`;
      continue;
    }

    const data = await res.json() as { choices: { message: { content: string } }[] };
    return data.choices[0].message.content;
  }

  throw new Error(`Todos los modelos fallaron. Último error: ${lastError}`);
}

export async function buildProfile360(params: {
  name: string;
  truora: TruoraProfile;
  tavily: TavilySignal[];
}): Promise<Profile360> {
  const webEvidence = params.tavily
    .map((s) => `[${s.title}] ${s.content}`)
    .join("\n\n");

  const prompt = `Eres un analista experto en riesgo crediticio. Responde ÚNICAMENTE con un objeto JSON válido, sin markdown, sin explicaciones, sin texto adicional.

El JSON debe tener exactamente estas claves:
- risk_score: número entre 0 (sin riesgo) y 100 (riesgo máximo)
- risk_level: exactamente "bajo" (0-33), "medio" (34-66) o "alto" (67-100)
- summary: párrafo ejecutivo de 2-3 oraciones
- red_flags: array de strings con alertas concretas (vacío si no hay)
- positive_signals: array de strings con indicadores favorables

Datos de entrada para "${params.name}":

VALIDACIÓN DE IDENTIDAD (Truora):
- Identidad confirmada: ${params.truora.identity_confirmed ? "SÍ" : "NO"}
- Listas de sanciones: ${params.truora.sanctions_hit ? "POSITIVO — alerta mayor" : "Limpio"}
- PEP (Persona Expuesta Políticamente): ${params.truora.pep_hit ? "SÍ — requiere debida diligencia" : "NO"}
- Registros judiciales: ${params.truora.judicial_records ? "SÍ — revisar detalle" : "Sin registros"}

SEÑALES WEB (búsqueda pública):
${webEvidence || "Sin resultados de búsqueda web disponibles."}`;

  const text = await callOpenRouter(prompt);

  // Extraer el bloque JSON (el modelo puede añadir texto extra o markdown)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("El modelo no devolvió JSON válido");

  const parsed = JSON.parse(jsonMatch[0]);
  const object = schema.parse(parsed);

  const sources = params.tavily.map((s) => ({ title: s.title, url: s.url }));

  return { ...object, sources };
}
