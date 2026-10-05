import type { ExperienceInput } from "./types";

export const identityScenarios: Record<"assembled" | "conflict", ExperienceInput> = {
  assembled: { registry: true, document: true, conflict: false },
  conflict: { registry: true, document: true, conflict: true },
};

export function isIdentityScenario(input: ExperienceInput, id: keyof typeof identityScenarios) {
  const scenario = identityScenarios[id];
  return input.registry === scenario.registry && input.document === scenario.document && input.conflict === scenario.conflict;
}
