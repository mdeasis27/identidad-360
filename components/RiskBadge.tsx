type RiskLevel = "bajo" | "medio" | "alto";

const STYLES: Record<RiskLevel, string> = {
  bajo: "bg-green-50 text-green-700 border-green-200",
  medio: "bg-yellow-50 text-yellow-700 border-yellow-200",
  alto: "bg-red-50 text-red-700 border-red-200",
};

export function RiskBadge({ level, score }: { level: RiskLevel; score: number }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${STYLES[level]}`}
    >
      Riesgo {level} · {score}/100
    </span>
  );
}
