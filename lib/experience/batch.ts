import { assembleProfile } from "./profile";
import type { ExperienceInput } from "./types";

export type BatchStatus = "assembled" | "reviewed" | "waiting" | "mismatched";
export type Applicant = { id: string } & ExperienceInput;

/** Twenty fictional applicants. Every third one has sources that contradict each other; two others lack the document. */
export const APPLICANTS: Applicant[] = Array.from({ length: 20 }, (_, i) => ({ id: `applicant-${i + 1}`, registry: true, document: i !== 0 && i !== 9, conflict: i % 3 === 2 }));

export type BatchResult = { items: { id: string; status: BatchStatus; coverage: number }[]; counts: Record<BatchStatus, number> };

/**
 * Assembles every profile with assembleProfile. Conflicts take an analyst seat in order; past the seats they wait for tomorrow.
 * Without the cross-check, conflicts go undetected and the profile is assembled from pieces that don't match.
 */
export function assembleBatch(seats: number, { crossCheck = true }: { crossCheck?: boolean } = {}): BatchResult {
  if (!Number.isInteger(seats) || seats < 0) throw new Error("Analyst seats must be a non-negative integer.");
  let used = 0;
  const items = APPLICANTS.map(({ id, ...a }) => {
    const profile = assembleProfile(crossCheck ? a : { ...a, conflict: false });
    const status: BatchStatus = profile.decision === "review" ? (used++ < seats ? "reviewed" : "waiting") : a.conflict ? "mismatched" : "assembled";
    return { id, status, coverage: profile.coverage };
  });
  const counts: Record<BatchStatus, number> = { assembled: 0, reviewed: 0, waiting: 0, mismatched: 0 };
  for (const i of items) counts[i.status]++;
  return { items, counts };
}
