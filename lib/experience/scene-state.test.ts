import { expect, it } from "vitest";
import { tapeCounts } from "@/design-system/demo/outcome-tape";
import { assembleBatch } from "./batch";
import { identityCells, revealedProfiles } from "./scene-state";

it("final tape counts match the batch", () => {
  expect(tapeCounts(identityCells(assembleBatch(2).items, 20))).toEqual({ served: 14, rerouted: 2, lost: 4, pending: 0 });
});

it("reveals five profiles per step, all when complete or under reduced motion", () => {
  expect(revealedProfiles({ visible: 1, total: 4, complete: false }, 20, false)).toBe(5);
  expect(revealedProfiles({ visible: 4, total: 4, complete: true }, 20, false)).toBe(20);
  expect(revealedProfiles({ visible: 1, total: 4, complete: false }, 20, true)).toBe(20);
});
