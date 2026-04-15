import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/truora", () => ({
  getIdentityProfile: vi.fn().mockResolvedValue({
    identity_confirmed: true,
    sanctions_hit: false,
    pep_hit: false,
    judicial_records: false,
    national_databases: { Colombia: true },
    raw: { source: "mock" },
  }),
}));

vi.mock("@/lib/tavily", () => ({
  searchPersonSignals: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/synthesizer", () => ({
  buildProfile360: vi.fn().mockResolvedValue({
    risk_score: 10,
    risk_level: "bajo",
    summary: "Sin señales de alerta.",
    red_flags: [],
    positive_signals: ["Identidad verificada"],
    sources: [],
  }),
}));

import { POST } from "./route";
import { NextRequest } from "next/server";

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost/api/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/profile", () => {
  it("retorna 400 si falta name", async () => {
    const req = makeRequest({ country: "Colombia" });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("retorna 400 si falta country", async () => {
    const req = makeRequest({ name: "Juan García" });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("retorna 200 con perfil completo para input válido", async () => {
    const req = makeRequest({ name: "Juan García", country: "Colombia" });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body).toMatchObject({
      profile: {
        risk_score: expect.any(Number),
        risk_level: expect.stringMatching(/^(bajo|medio|alto)$/),
        summary: expect.any(String),
      },
      truora: {
        identity_confirmed: expect.any(Boolean),
        sanctions_hit: expect.any(Boolean),
      },
      name: "Juan García",
      country: "Colombia",
    });
  });
});
