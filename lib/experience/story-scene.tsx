"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { PlaybackFrame } from "@/design-system/demo/playback";
import type { TraceEvent } from "@/design-system/demo/types";
import { StoryStage } from "@/design-system/demo/decision-lab";
import { OutcomeTape, useReducedMotion } from "@/design-system/demo/project-story";
import { tapeCounts } from "@/design-system/demo/outcome-tape";
import type { BatchStatus } from "./batch";
import type { MissionResult } from "./mission";
import { identityCells, LAYOUTS, placeProfiles, revealedProfiles, stepRange, type PuzzleLayout } from "./scene-state";
import { STORY } from "./story";

type LayoutKey = keyof typeof LAYOUTS;
const WIDE = "(min-width: 640px)";
function subscribeWidth(callback: () => void) {
  const media = window.matchMedia(WIDE);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const useLayoutKey = (): LayoutKey => useSyncExternalStore(subscribeWidth, () => (window.matchMedia(WIDE).matches ? "wide" : "tall"), () => "wide");

const FINAL: Record<BatchStatus, string> = { assembled: "fill-success", reviewed: "fill-info", waiting: "fill-danger", mismatched: "fill-danger" };
const GLYPH: Partial<Record<BatchStatus, string>> = { reviewed: "✓", waiting: "×", mismatched: "×" };
const KNOB = "M0 -19 h20 a4 4 0 0 1 4 4 v30 a4 4 0 0 1 -4 4 h-20 v-12 a7 7 0 0 0 0 -14 z";
const CROOKED = "translate(7px, -9px) rotate(16deg)";
const STRAIGHT = "translate(0px, 0px) rotate(0deg)";
const STAGGER_MS = 150;
const at = (x: number, y: number, s = 1) => `translate(${x}px, ${y}px) scale(${s})`;

/** Milestones (ms) of one piece: both halves meet at the check, then it lands on the board, in a seat or in tomorrow's tray. */
function timeline(kind: BatchStatus) {
  if (kind === "reviewed") return { total: 2560, verdict: [1820, 1980], stops: [[0, "check"], [700, "check"], [1220, "seat"], [2080, "seat"], [2560, "end"]] as const };
  if (kind === "waiting") return { total: 1400, verdict: [1260, 1400], stops: [[0, "check"], [700, "check"], [1260, "end"], [1400, "end"]] as const };
  return { total: 1120, verdict: [520, 640], stops: [[0, "check"], [640, "check"], [1120, "end"]] as const };
}

function endOf(layout: PuzzleLayout, index: number, kind: BatchStatus, tray: number | null) {
  return kind === "waiting" && tray !== null ? layout.tray(tray) : { ...layout.slot(index), s: 1 };
}

function Piece({ id, layoutKey, index, kind, seat, tray, seats, halfPiece, animate, stagger, onLanded }: { id: string; layoutKey: LayoutKey; index: number; kind: BatchStatus; seat: number | null; tray: number | null; seats: number; halfPiece: boolean; animate: boolean; stagger: () => number; onLanded: (id: string, landed: boolean) => void }) {
  const group = useRef<SVGGElement>(null);
  const registry = useRef<SVGGElement>(null);
  const idDoc = useRef<SVGGElement>(null);
  const layout = LAYOUTS[layoutKey];
  const end = endOf(layout, index, kind, tray);
  const crooked = kind === "waiting" || kind === "mismatched";

  useEffect(() => {
    const g = group.current, L = registry.current, R = idDoc.current;
    if (!animate || !g || !L || !R) { onLanded(id, true); return; }
    onLanded(id, false);
    const { check, pieceA, pieceB } = layout;
    const t = timeline(kind);
    const box = kind === "reviewed" && seat !== null ? layout.seat(seat, seats) : { ...check, s: 1 };
    const spot = { check: { ...check, s: 1 }, seat: box, end };
    const o = (ms: number) => ms / t.total;
    const opts: KeyframeAnimationOptions = { duration: t.total, delay: stagger(), easing: "linear", fill: "backwards" };
    const ease = "cubic-bezier(.4,0,.2,1)";
    const conflict = kind === "reviewed" || kind === "waiting";
    const running = [
      g.animate(t.stops.map(([ms, name]) => ({ offset: o(ms), transform: at(spot[name].x, spot[name].y, spot[name].s), easing: ease })), opts),
      g.animate([{ opacity: 0, offset: 0 }, { opacity: 1, offset: o(120) }, { opacity: 1, offset: 1 }], opts),
      L.animate([{ offset: 0, transform: `translate(${pieceA.x - check.x}px, ${pieceA.y - check.y}px)`, easing: "ease-out" }, { offset: o(420), transform: "translate(0px, 0px)" }, { offset: 1, transform: "translate(0px, 0px)" }], opts),
      R.animate([
        { offset: 0, transform: `translate(${pieceB.x - check.x}px, ${pieceB.y - check.y}px) rotate(0deg)`, easing: "ease-out" },
        { offset: o(420), transform: STRAIGHT },
        ...(conflict ? [{ offset: o(560), transform: CROOKED }] : []),
        ...(kind === "reviewed" ? [{ offset: o(t.verdict[0]), transform: CROOKED }, { offset: o(t.verdict[1]), transform: STRAIGHT }] : []),
        { offset: 1, transform: crooked ? CROOKED : STRAIGHT },
      ], opts),
      ...Array.from(g.querySelectorAll<SVGElement>("[data-neutral]"), n => n.animate([{ opacity: 1, offset: 0 }, { opacity: 1, offset: o(t.verdict[0]) }, { opacity: 0, offset: o(t.verdict[1]) }, { opacity: 0, offset: 1 }], opts)),
      ...Array.from(g.querySelectorAll<SVGElement>("[data-glyph]"), n => n.animate([{ opacity: 0, offset: 0 }, { opacity: 0, offset: o(t.verdict[0]) }, { opacity: 1, offset: o(t.verdict[1]) }, { opacity: 1, offset: 1 }], opts)),
    ];
    // A cancelled animation rejects `finished`; the piece then lands through the next effect run instead.
    running[0].finished.then(() => onLanded(id, true), () => {});
    return () => running.forEach(a => a.cancel());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- a piece animates once per mount; its position is derived from these primitives.
  }, [animate, layoutKey, index, kind, seat, tray, seats]);

  const color = FINAL[kind];
  return <g ref={group} data-piece={kind} style={{ transform: at(end.x, end.y, end.s) }}>
    <g ref={registry}>
      <rect x={-24} y={-19} width={24} height={38} rx={4} className={color} />
      <circle r={7} className={color} />
      <rect data-neutral x={-24} y={-19} width={24} height={38} rx={4} className="fill-[#c9b48a]" opacity={0} />
      <circle data-neutral r={7} className="fill-[#c9b48a]" opacity={0} />
    </g>
    <g ref={idDoc} style={{ transform: crooked ? CROOKED : STRAIGHT }}>
      {halfPiece
        ? <path d={KNOB} fill="none" strokeWidth={1.5} strokeDasharray="3 3" className="stroke-muted-foreground" />
        : <><path d={KNOB} className={color} /><path data-neutral d={KNOB} className="fill-[#a89a7c]" opacity={0} /></>}
    </g>
    {GLYPH[kind] ? <text data-glyph x={kind === "reviewed" ? -10 : 0} y={7} textAnchor="middle" fontSize={20} fontWeight={700} className="fill-white">{GLYPH[kind]}</text> : null}
  </g>;
}

function Analyst({ x, y, s }: { x: number; y: number; s: number }) {
  return <g className="fill-info/70">
    <circle cx={x} cy={y - 40 * s} r={8 * s} />
    <path d={`M${x - 14 * s} ${y - 24 * s} q${14 * s} ${-18 * s} ${28 * s} 0 z`} />
    <rect x={x - 27 * s} y={y - 22 * s} width={54 * s} height={44 * s} rx={6 * s} fill="none" strokeWidth={1} className="stroke-info/50" />
  </g>;
}

function Label({ x, y, children, size, muted = false }: { x: number; y: number; children: string; size: number; muted?: boolean }) {
  return <text x={x} y={y} textAnchor="middle" fontSize={size} fontWeight={muted ? 400 : 600} className={muted ? "fill-muted-foreground" : "fill-foreground"}>{children}</text>;
}

/**
 * `skip`: the visitor asked for the whole trace ("Show all"), so the pieces land at once when the frame is complete.
 * `onSettled`: fires once every piece has landed, which is when the comparison below may appear.
 */
export function IdentidadStoryScene({ frame, result, seats, locale, skip = false, onSettled }: { frame: PlaybackFrame<TraceEvent>; result: MissionResult; seats: number; locale: "en" | "es"; skip?: boolean; onSettled?: () => void }) {
  const story = STORY[locale];
  const copy = story.scene;
  const puzzle = copy.puzzle;
  const reduced = useReducedMotion();
  const layoutKey = useLayoutKey();
  const layout = LAYOUTS[layoutKey];
  const [stagger] = useState(() => { let next = 0; return () => { const now = performance.now(); const start = Math.max(now, next); next = start + STAGGER_MS; return start - now; }; });

  const animate = !reduced && !(skip && frame.complete);
  const [landed, setLanded] = useState<ReadonlySet<string>>(() => new Set());
  const [onLanded] = useState(() => (id: string, on: boolean) => setLanded(prev => {
    if (prev.has(id) === on) return prev;
    const next = new Set(prev);
    if (on) next.add(id); else next.delete(id);
    return next;
  }));

  const revealed = revealedProfiles(frame, result.items.length, reduced);
  const cells = identityCells(result.items, revealed);
  const counts = tapeCounts(cells);
  const placed = placeProfiles(result.items).slice(0, revealed);
  const waiting = placed.filter(p => p.kind === "waiting").length;
  const reviewed = placed.filter(p => p.kind === "reviewed").length;
  const showBatch = !reduced && !frame.complete && frame.total > 0;
  const [from, to] = stepRange(frame, result.items.length, reduced);
  const settled = revealed === result.items.length && placed.every(p => landed.has(p.id));
  const onSettledRef = useRef(onSettled);
  useEffect(() => { onSettledRef.current = onSettled; });
  useEffect(() => { if (settled) onSettledRef.current?.(); }, [settled]);
  const { boxA, boxB, check, seats: seatBox, trayBox, font } = layout;
  const label = (b: { x: number; y: number; w: number }) => ({ x: b.x + b.w / 2, y: b.y + font + 8 });

  return <StoryStage locale={locale} title={copy.title} caption={copy.caption} step={frame.visible} total={frame.total}>
    <svg key={layoutKey} data-puzzle={layoutKey} viewBox={`0 0 ${layout.width} ${layout.height}`} role="img" aria-label={puzzle.summary(revealed - reviewed - waiting, reviewed, waiting, result.items.length)} className="block h-auto w-full font-sans">
      <rect x={boxA.x} y={boxA.y} width={boxA.w} height={boxA.h} rx={8} strokeWidth={1} className="fill-[#c9b48a]/15 stroke-[#c9b48a]/60" />
      <Label {...label(boxA)} size={font}>{puzzle.registry}</Label>
      <rect x={boxB.x} y={boxB.y} width={boxB.w} height={boxB.h} rx={8} strokeWidth={1} className="fill-[#a89a7c]/15 stroke-[#a89a7c]/60" />
      <Label {...label(boxB)} size={font}>{puzzle.document}</Label>
      <circle cx={check.x} cy={check.y} r={check.r} fill="none" strokeWidth={1.5} strokeDasharray="5 5" className="stroke-muted-foreground" />
      <Label {...layout.checkLabel} size={font}>{puzzle.fits}</Label>

      <Label {...layout.boardTitle} size={font}>{puzzle.board}</Label>
      {Array.from({ length: result.items.length }, (_, i) => { const p = layout.slot(i); return <rect key={i} x={p.x - 28} y={p.y - 24} width={56} height={48} rx={6} fill="none" strokeWidth={1} strokeDasharray="4 4" className="stroke-border" />; })}

      <rect x={seatBox.x} y={seatBox.y} width={seatBox.w} height={seatBox.h} rx={10} strokeWidth={1} className="fill-info/10 stroke-info/40" />
      <Label {...label(seatBox)} size={font}>{puzzle.analysts(seats)}</Label>
      {Array.from({ length: seats }, (_, k) => <Analyst key={k} {...layout.seat(k, seats)} />)}

      <rect x={trayBox.x} y={trayBox.y} width={trayBox.w} height={trayBox.h} rx={10} strokeWidth={1} className="fill-danger/10 stroke-danger/40" />
      <Label {...label(trayBox)} size={font}>{puzzle.tomorrow}</Label>

      {placed.map(p => <Piece key={p.id} id={p.id} layoutKey={layoutKey} index={p.index} kind={p.kind} seat={p.seat} tray={p.tray} seats={seats} halfPiece={p.halfPiece} animate={animate} stagger={stagger} onLanded={onLanded} />)}
      {showBatch ? <Label {...layout.phase} size={font - 2} muted>{puzzle.batch(from, to)}</Label> : null}
    </svg>
    <div className="mt-6">
      <OutcomeTape cells={cells} labels={copy.tape} ariaLabel={copy.tapeLabel(result.items.length)} columns={10} />
      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><span aria-hidden="true" className="inline-block size-2.5 rounded-sm border border-dashed border-muted-foreground" />{puzzle.halfPiece}</p>
      <p className="mt-4 font-mono text-2xl font-semibold tracking-tight" data-scene-result data-settled={settled}>{copy.resolvedOf(counts.served + counts.rerouted)}</p>
      <p className="mt-1 text-sm text-muted-foreground">{story.compare.waiting(waiting)}</p>
    </div>
  </StoryStage>;
}
