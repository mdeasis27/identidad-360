import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("getIdentityProfile (mock mode)", () => {
  beforeEach(() => {
    process.env.TRUORA_MOCK = "true";
    delete process.env.TRUORA_API_KEY;
  });

  afterEach(() => {
    delete process.env.TRUORA_MOCK;
  });

  it("retorna la estructura correcta para cualquier input", async () => {
    const { getIdentityProfile } = await import("./truora");
    const result = await getIdentityProfile({ name: "Juan García", country: "Colombia" });

    expect(result).toMatchObject({
      identity_confirmed: expect.any(Boolean),
      sanctions_hit: expect.any(Boolean),
      pep_hit: expect.any(Boolean),
      judicial_records: expect.any(Boolean),
      national_databases: expect.any(Object),
      raw: expect.any(Object),
    });
  });

  it("es determinista: el mismo input siempre retorna el mismo resultado", async () => {
    const { getIdentityProfile } = await import("./truora");
    const params = { name: "María López", country: "México", document_id: "ABC123" };

    const result1 = await getIdentityProfile(params);
    const result2 = await getIdentityProfile(params);

    expect(result1.identity_confirmed).toBe(result2.identity_confirmed);
    expect(result1.sanctions_hit).toBe(result2.sanctions_hit);
    expect(result1.pep_hit).toBe(result2.pep_hit);
    expect(result1.judicial_records).toBe(result2.judicial_records);
  });

  it("incluye el país en national_databases", async () => {
    const { getIdentityProfile } = await import("./truora");
    const result = await getIdentityProfile({ name: "Carlos Ruiz", country: "Peru" });

    expect(result.national_databases).toHaveProperty("Peru");
  });

  it("raw incluye source=mock", async () => {
    const { getIdentityProfile } = await import("./truora");
    const result = await getIdentityProfile({ name: "Ana Torres", country: "Chile" });

    expect(result.raw).toMatchObject({ source: "mock" });
  });
});
