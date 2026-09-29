import { StatusBadge } from "@/design-system/components/status-badge";

interface ChipProps {
  ok: boolean;
  labelOk: string;
  labelFail: string;
}

export function Chip({ ok, labelOk, labelFail }: ChipProps) {
  return (
    <StatusBadge tone={ok ? "success" : "danger"} className="gap-1 px-3 py-1">
      {ok ? "✓" : "✗"} {ok ? labelOk : labelFail}
    </StatusBadge>
  );
}