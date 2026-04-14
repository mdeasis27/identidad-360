// Cliente Truora — background check para perfiles de crédito

const TRUORA_BASE = "https://api.truora.com";

export interface TruoraProfile {
  identity_confirmed: boolean;
  sanctions_hit: boolean;
  pep_hit: boolean;
  judicial_records: boolean;
  national_databases: Record<string, boolean>;
  raw: Record<string, unknown>;
}

async function request<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${TRUORA_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Truora-API-Key": process.env.TRUORA_API_KEY!,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Truora ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

// Mock realista para demo sin Truora
function getMockIdentityProfile(params: { name: string; country: string }): TruoraProfile {
  // Simulación determinista basada en el nombre (para demo consistente)
  const nameHash = params.name.length % 3;
  return {
    identity_confirmed: true,
    sanctions_hit: nameHash === 0 && false, // siempre false en demo
    pep_hit: false,
    judicial_records: false,
    national_databases: { [params.country]: true },
    raw: { source: "mock", note: "Demo data - connect Truora API for real verification" },
  };
}

export async function getIdentityProfile(params: {
  name: string;
  document_id?: string;
  country: string;
}): Promise<TruoraProfile> {
  if (!process.env.TRUORA_API_KEY || process.env.TRUORA_MOCK === "true") {
    return getMockIdentityProfile(params);
  }

  // Llamada real a Truora
  const data = await request<Record<string, unknown>>("/v1/checks", {
    ...params,
    type: "background_check",
  });

  return {
    identity_confirmed: Boolean(data.identity_confirmed),
    sanctions_hit: Boolean(data.sanctions_hit),
    pep_hit: Boolean(data.pep_hit),
    judicial_records: Boolean(data.judicial_records),
    national_databases: (data.national_databases as Record<string, boolean>) ?? {},
    raw: data,
  };
}
