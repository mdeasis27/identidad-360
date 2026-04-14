import { NextRequest, NextResponse } from "next/server";
import { getIdentityProfile } from "@/lib/truora";
import { searchPersonSignals } from "@/lib/tavily";
import { buildProfile360 } from "@/lib/synthesizer";

export async function POST(req: NextRequest) {
  try {
    const { name, document_id, country } = await req.json();

    if (!name || !country) {
      return NextResponse.json(
        { error: "name y country son requeridos" },
        { status: 400 }
      );
    }

    const [truora, tavily] = await Promise.all([
      getIdentityProfile({ name, document_id, country }),
      searchPersonSignals(name, country),
    ]);

    const profile = await buildProfile360({ name, truora, tavily });

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
    return NextResponse.json(
      { error: "Error al construir perfil 360°" },
      { status: 500 }
    );
  }
}
