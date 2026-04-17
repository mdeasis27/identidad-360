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
// Esta función simula diferentes escenarios para demostrar cómo respondería la API real
function getMockIdentityProfile(params: { name: string; country: string; document_id?: string }): TruoraProfile {
  // Simulación determinista basada en el hash del nombre y documento
  // Esto permite mostrar diferentes perfiles de riesgo para demostración
  const nameHash = params.name.toLowerCase().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const docHash = params.document_id ? params.document_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
  const combinedHash = (nameHash + docHash) % 10;
  
  // Diferentes escenarios basados en el hash combinado
  switch (true) {
    case combinedHash < 2: // 20% - Perfil de alto riesgo
      return {
        identity_confirmed: true,
        sanctions_hit: combinedHash === 0, // 10% de probabilidad
        pep_hit: combinedHash === 1, // 10% de probabilidad
        judicial_records: combinedHash < 1, // 10% de probabilidad
        national_databases: { [params.country]: true },
        raw: { 
          source: "mock", 
          note: "Demo data - High risk profile simulated for demonstration",
          risk_factors: combinedHash === 0 ? ["sanctions_hit"] : 
                       combinedHash === 1 ? ["pep_hit"] : 
                       ["judicial_records"]
        },
      };
    case combinedHash < 5: // 30% - Perfil medio riesgo
      return {
        identity_confirmed: true,
        sanctions_hit: false,
        pep_hit: false,
        judicial_records: combinedHash === 3, // 10% de probabilidad
        national_databases: { [params.country]: true },
        raw: { 
          source: "mock", 
          note: "Demo data - Medium risk profile simulated for demonstration",
          risk_factors: combinedHash === 3 ? ["judicial_records"] : [],
        },
      };
    default: // 50% - Perfil bajo riesgo
      return {
        identity_confirmed: true,
        sanctions_hit: false,
        pep_hit: false,
        judicial_records: false,
        national_databases: { [params.country]: true },
        raw: { 
          source: "mock", 
          note: "Demo data - Low risk profile simulated for demonstration",
        },
      };
  }
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
