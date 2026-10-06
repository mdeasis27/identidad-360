import { expect, it } from "vitest";
import { runMission } from "./mission";

it("reveals the 20 profiles five at a time and compares with no cross-check", async () => {
  const r = await runMission({ seats: 2 }, new AbortController().signal, () => {});
  expect(r.trace).toHaveLength(4);
  expect(r.trace[0].evidenceIds).toEqual(["applicant-1", "applicant-2", "applicant-3", "applicant-4", "applicant-5"]);
  expect(r.result.resolved).toBe(16);
  expect(r.result.comparison).toEqual({ withCheck: { mismatched: 0, waiting: 4 }, withoutCheck: { mismatched: 6, waiting: 0 } });
});

it("stops when aborted", async () => {
  const c = new AbortController(); c.abort();
  await expect(runMission({ seats: 2 }, c.signal, () => {})).rejects.toThrow();
});
