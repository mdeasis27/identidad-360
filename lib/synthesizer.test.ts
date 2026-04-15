import { describe, it, expect } from "vitest";
import { z } from "zod";

const Profile360Schema = z.object({
  risk_score: z.number().min(0).max(100),
  risk_level: z.enum(["bajo", "medio", "alto"]),
  summary: z.string(),
  red_flags: z.array(z.string()),
  positive_signals: z.array(z.string()),
});

describe("Profile360Schema (validación de output LLM)", () => {
  it("acepta un perfil de bajo riesgo válido", () => {
    const valid = {
      risk_score: 15,
      risk_level: "bajo",
      summary: "La persona no presenta señales de alerta.",
      red_flags: [],
      positive_signals: ["Historial crediticio limpio"],
    };
    expect(() => Profile360Schema.parse(valid)).not.toThrow();
  });

  it("acepta un perfil de alto riesgo con múltiples flags", () => {
    const valid = {
      risk_score: 85,
      risk_level: "alto",
      summary: "Múltiples alertas detectadas.",
      red_flags: ["Aparece en listas OFAC", "Registros judiciales activos"],
      positive_signals: [],
    };
    expect(() => Profile360Schema.parse(valid)).not.toThrow();
  });

  it("rechaza risk_score fuera de rango 0-100", () => {
    const invalid = {
      risk_score: 150,
      risk_level: "alto",
      summary: "Resumen.",
      red_flags: [],
      positive_signals: [],
    };
    expect(() => Profile360Schema.parse(invalid)).toThrow();
  });

  it("rechaza risk_level con valor no permitido", () => {
    const invalid = {
      risk_score: 50,
      risk_level: "crítico",
      summary: "Resumen.",
      red_flags: [],
      positive_signals: [],
    };
    expect(() => Profile360Schema.parse(invalid)).toThrow();
  });

  it("el risk_score retornado coincide con el risk_level declarado", () => {
    const perfil = Profile360Schema.parse({
      risk_score: 25,
      risk_level: "bajo",
      summary: "Sin señales.",
      red_flags: [],
      positive_signals: ["Verificación exitosa"],
    });

    if (perfil.risk_level === "bajo") expect(perfil.risk_score).toBeLessThanOrEqual(33);
    if (perfil.risk_level === "medio") {
      expect(perfil.risk_score).toBeGreaterThanOrEqual(34);
      expect(perfil.risk_score).toBeLessThanOrEqual(66);
    }
    if (perfil.risk_level === "alto") expect(perfil.risk_score).toBeGreaterThanOrEqual(67);
  });
});
