import { NextRequest, NextResponse } from "next/server";
import { getIdentityProfile } from "@/lib/truora";
import { searchPersonSignals } from "@/lib/tavily";
import { buildProfile360 } from "@/lib/synthesizer";
import { rateLimit } from "@/ai-kit/rate-limit";
import type { UserApiKey } from "@/ai-kit/types";

function parseByokHeader(header: string | null): UserApiKey | null {
  if (!header) return null;
  try {
    const parsed = JSON.parse(header) as unknown;
    if (typeof parsed === "object" && parsed !== null && "provider" in parsed && "key" in parsed) {
      return parsed as UserApiKey;
    }
  } catch {
    // ignore
  }
  return null;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const { allowed } = rateLimit(ip, { maxRequests: 10, windowMs: 60 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Vuelve en una hora." }, { status: 429 });
  }

  try {
    const { name, document_id, country } = await req.json();

    if (!name || !country) {
      return NextResponse.json({ error: "name y country son requeridos" }, { status: 400 });
    }

    const userApiKey = parseByokHeader(req.headers.get("x-user-api-key"));

    const [truora, tavily] = await Promise.all([
      getIdentityProfile({ name, document_id, country }),
      searchPersonSignals(name, country),
    ]);

    const profile = await buildProfile360({ name, truora, tavily, userApiKey: userApiKey ?? undefined });

    return NextResponse.json({
      profile,
      truora: {
        identity_confirmed: truora.identity_confirmed,
        sanctions_hit: truora.sanctions_hit,
        pep_hit: truora.pep_hit,
        judicial_records: truora.judicial_records,
      },
      name,
      country,
    });
  } catch (err) {
    console.error("[/api/profile]", err);
    return NextResponse.json({ error: "Error al construir perfil 360°" }, { status: 500 });
  }
}
