import { describe, expect, it } from "vitest";
import { identityScenarios, isIdentityScenario } from "./story";
import { assembleProfile } from "./profile";

describe("identity story presets", () => {
  it("keeps the two preset decisions distinct", () => {
    expect(assembleProfile(identityScenarios.assembled).decision).toBe("assembled");
    expect(assembleProfile(identityScenarios.conflict).decision).toBe("review");
  });

  it("detects when a manual change no longer matches a preset", () => {
    expect(isIdentityScenario(identityScenarios.assembled, "assembled")).toBe(true);
    expect(isIdentityScenario({ ...identityScenarios.assembled, document: false }, "assembled")).toBe(false);
  });
});
