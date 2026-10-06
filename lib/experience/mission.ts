import type { DemoAdapter, TraceEvent } from "./types";
import { assembleBatch, type BatchResult } from "./batch";

export type MissionInput = { seats: number };
type Tally = { mismatched: number; waiting: number };
export type MissionResult = BatchResult & { resolved: number; comparison: { withCheck: Tally; withoutCheck: Tally } };

const STEP = 5;
const tally = (b: BatchResult): Tally => ({ mismatched: b.counts.mismatched, waiting: b.counts.waiting });

/** Assembles the 20 profiles with the chosen number of analysts; the trace reveals them five at a time. */
export const runMission: DemoAdapter<MissionInput, MissionResult> = async (input, signal, onEvent) => {
  const startedAt = performance.now();
  const batch = assembleBatch(input.seats);
  const trace: TraceEvent[] = [];
  for (let i = 0; i < batch.items.length; i += STEP) {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    const n = i / STEP + 1;
    const event: TraceEvent = { id: `batch-${n}`, step: n, kind: "decision", messageKey: `batch.${n}`, timestampMs: performance.now() - startedAt, evidenceIds: batch.items.slice(i, i + STEP).map(a => a.id) };
    trace.push(event);
    onEvent(event);
  }
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  const resolved = batch.counts.assembled + batch.counts.reviewed;
  return { input, result: { ...batch, resolved, comparison: { withCheck: tally(batch), withoutCheck: tally(assembleBatch(input.seats, { crossCheck: false })) } }, trace, executionMs: performance.now() - startedAt, mode: "local" };
};
