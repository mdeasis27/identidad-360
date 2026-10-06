import { describe, expect, it } from "vitest";
import { APPLICANTS, assembleBatch } from "./batch";

describe("identity batch", () => {
  it("has 20 fictional applicants, 6 with conflicting evidence", () => {
    expect(APPLICANTS).toHaveLength(20);
    expect(APPLICANTS.filter(a => a.conflict)).toHaveLength(6);
  });

  it("with 2 analysts, 16 are resolved today; with 3, 17", () => {
    expect(assembleBatch(2).counts).toEqual({ assembled: 14, reviewed: 2, waiting: 4, mismatched: 0 });
    expect(assembleBatch(3).counts).toEqual({ assembled: 14, reviewed: 3, waiting: 3, mismatched: 0 });
  });

  it("without the cross-check, every conflict is assembled wrong and nobody waits", () => {
    expect(assembleBatch(2, { crossCheck: false }).counts).toEqual({ assembled: 14, reviewed: 0, waiting: 0, mismatched: 6 });
  });

  it("a missing document lowers coverage without sending the profile to review", () => {
    expect(assembleBatch(0).items.filter(i => i.coverage === 50 && i.status === "assembled")).toHaveLength(2);
  });

  it("sweep: both bet answers are reachable, and the default (2) says no", () => {
    const answers = new Set<boolean>();
    for (let k = 0; k <= 8; k++) answers.add(assembleBatch(k).counts.assembled + assembleBatch(k).counts.reviewed >= 17);
    expect([...answers].sort()).toEqual([false, true]);
    expect(assembleBatch(2).counts.assembled + assembleBatch(2).counts.reviewed >= 17).toBe(false);
  });

  it("rejects a negative or fractional seat count", () => {
    expect(() => assembleBatch(-1)).toThrow();
    expect(() => assembleBatch(1.5)).toThrow();
  });
});
