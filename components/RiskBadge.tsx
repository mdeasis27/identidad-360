import { StatusBadge } from "@/design-system/components/status-badge";
import type { Tone } from "@/design-system/components/tone";

type RiskLevel = "bajo" | "medio" | "alto";

const TONE: Record<RiskLevel, Tone> = {
  bajo: "success",
  medio: "warning",
  alto: "danger",
};

export function RiskBadge({ level, score }: { level: RiskLevel; score: number }) {
  return (
    <StatusBadge tone={TONE[level]} dot className="gap-1.5 px-3 py-1 text-sm">
      Riesgo {level} · {score}/100
    </StatusBadge>
  );
}