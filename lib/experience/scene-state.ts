import type { TapeStatus } from "@/design-system/demo/outcome-tape";
import type { PlaybackFrame } from "@/design-system/demo/playback";
import type { TraceEvent } from "@/design-system/demo/types";
import type { BatchStatus } from "./batch";

const CELL: Record<BatchStatus, TapeStatus> = { assembled: "served", reviewed: "rerouted", waiting: "lost", mismatched: "lost" };

export function identityCells(items: readonly { status: BatchStatus }[], revealed: number): TapeStatus[] {
  return items.map((a, i) => (i >= revealed ? "pending" : CELL[a.status]));
}

export function revealedProfiles(frame: { visible: number; total: number; complete: boolean }, n: number, reducedMotion: boolean): number {
  if (reducedMotion || frame.complete || frame.total === 0) return n;
  return Math.ceil((n * frame.visible) / frame.total);
}

export const COMPLETE_FRAME: PlaybackFrame<TraceEvent> = { visible: 0, total: 0, event: undefined, complete: true };

export type PlacedProfile = { id: string; index: number; kind: BatchStatus; seat: number | null; tray: number | null; halfPiece: boolean };

/** Where each profile ends up: conflicts take analyst seats in arrival order, the rest go to tomorrow's tray. Coverage under 100 means the ID document is missing. */
export function placeProfiles(items: readonly { id: string; status: BatchStatus; coverage: number }[]): PlacedProfile[] {
  let seat = 0;
  let tray = 0;
  return items.map((it, index) => ({ id: it.id, index, kind: it.status, seat: it.status === "reviewed" ? seat++ : null, tray: it.status === "waiting" ? tray++ : null, halfPiece: it.coverage < 100 }));
}

type Pt = { x: number; y: number };
type Box = Pt & { w: number; h: number };
export type PuzzleLayout = {
  width: number; height: number; font: number;
  boxA: Box; boxB: Box; pieceA: Pt; pieceB: Pt; check: Pt & { r: number }; checkLabel: Pt; boardTitle: Pt; phase: Pt;
  slot: (i: number) => Pt; seats: Box; seat: (k: number, n: number) => Pt & { s: number }; trayBox: Box; tray: (k: number) => Pt & { s: number };
};

/** Two drawings of the same puzzle: side by side from 640px, stacked on phones so the labels stay readable. */
export const LAYOUTS: Record<"wide" | "tall", PuzzleLayout> = {
  wide: {
    width: 720, height: 420, font: 16,
    boxA: { x: 14, y: 56, w: 124, h: 72 }, boxB: { x: 14, y: 144, w: 124, h: 72 }, pieceA: { x: 76, y: 104 }, pieceB: { x: 76, y: 192 },
    check: { x: 76, y: 290, r: 44 }, checkLabel: { x: 76, y: 358 }, boardTitle: { x: 335, y: 40 }, phase: { x: 335, y: 400 },
    slot: i => ({ x: 200 + (i % 5) * 68, y: 82 + Math.floor(i / 5) * 72 }),
    seats: { x: 528, y: 56, w: 180, h: 140 },
    seat: (k, n) => (n <= 2 ? { x: 578 + k * 80, y: 152, s: 0.85 } : { x: 555 + (k % 4) * 42, y: 122 + Math.floor(k / 4) * 46, s: 0.6 }),
    trayBox: { x: 528, y: 212, w: 180, h: 120 },
    tray: k => ({ x: 563 + (k % 3) * 55, y: 268 + Math.floor(k / 3) * 40, s: 0.6 }),
  },
  tall: {
    width: 360, height: 672, font: 15,
    boxA: { x: 10, y: 20, w: 160, h: 80 }, boxB: { x: 190, y: 20, w: 160, h: 80 }, pieceA: { x: 90, y: 74 }, pieceB: { x: 270, y: 74 },
    check: { x: 180, y: 150, r: 34 }, checkLabel: { x: 180, y: 206 }, boardTitle: { x: 180, y: 248 }, phase: { x: 180, y: 662 },
    slot: i => ({ x: 52 + (i % 5) * 64, y: 290 + Math.floor(i / 5) * 62 }),
    seats: { x: 10, y: 514, w: 165, h: 126 },
    seat: (k, n) => (n <= 2 ? { x: 52 + k * 80, y: 604, s: 0.8 } : { x: 31 + (k % 4) * 41, y: 586 + Math.floor(k / 4) * 40, s: 0.55 }),
    trayBox: { x: 185, y: 514, w: 165, h: 126 },
    tray: k => ({ x: 220 + (k % 3) * 48, y: 582 + Math.floor(k / 3) * 38, s: 0.6 }),
  },
};
