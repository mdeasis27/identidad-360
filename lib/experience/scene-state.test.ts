import { describe, expect, it } from "vitest";
import { tapeCounts } from "@/design-system/demo/outcome-tape";
import { assembleBatch } from "./batch";
import { identityCells, LAYOUTS, placeProfiles, revealedProfiles } from "./scene-state";

it("final tape counts match the batch", () => {
  expect(tapeCounts(identityCells(assembleBatch(2).items, 20))).toEqual({ served: 14, rerouted: 2, lost: 4, pending: 0 });
});

it("reveals five profiles per step, all when complete or under reduced motion", () => {
  expect(revealedProfiles({ visible: 1, total: 4, complete: false }, 20, false)).toBe(5);
  expect(revealedProfiles({ visible: 4, total: 4, complete: true }, 20, false)).toBe(20);
  expect(revealedProfiles({ visible: 1, total: 4, complete: false }, 20, true)).toBe(20);
});

describe("puzzle placement", () => {
  it("gives conflicts analyst seats in arrival order and sends the rest to tomorrow", () => {
    const placed = placeProfiles(assembleBatch(2).items);
    expect(placed.filter(p => p.kind === "reviewed").map(p => [p.index, p.seat])).toEqual([[2, 0], [5, 1]]);
    expect(placed.filter(p => p.kind === "waiting").map(p => [p.index, p.tray])).toEqual([[8, 0], [11, 1], [14, 2], [17, 3]]);
    expect(placed.filter(p => p.kind === "assembled")).toHaveLength(14);
    expect(placed.filter(p => p.halfPiece).map(p => p.index)).toEqual([0, 9]);
  });

  it("follows the analyst count: none waits with 8, six wait with 0", () => {
    expect(placeProfiles(assembleBatch(8).items).filter(p => p.kind === "waiting")).toHaveLength(0);
    expect(placeProfiles(assembleBatch(0).items).filter(p => p.kind === "waiting").map(p => p.tray)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("keeps every slot, seat and tray spot inside the drawing for 0 to 8 analysts", () => {
    for (const layout of [LAYOUTS.wide, LAYOUTS.tall]) {
      const inside = ({ x, y }: { x: number; y: number }) => x > 0 && x < layout.width && y > 0 && y < layout.height;
      for (let i = 0; i < 20; i++) expect(inside(layout.slot(i)), `slot ${i}`).toBe(true);
      for (let seats = 0; seats <= 8; seats++) {
        for (let k = 0; k < seats; k++) {
          const p = layout.seat(k, seats);
          expect(inside(p), `seat ${k}/${seats}`).toBe(true);
          expect(p.x > layout.seats.x && p.x < layout.seats.x + layout.seats.w && p.y > layout.seats.y && p.y < layout.seats.y + layout.seats.h).toBe(true);
        }
        for (let k = 0; k < 6; k++) {
          const p = layout.tray(k);
          expect(p.x > layout.trayBox.x && p.x < layout.trayBox.x + layout.trayBox.w && p.y > layout.trayBox.y && p.y < layout.trayBox.y + layout.trayBox.h, `tray ${k}`).toBe(true);
        }
      }
    }
  });
});
