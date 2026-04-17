interface ChipProps {
  ok: boolean;
  labelOk: string;
  labelFail: string;
}

export function Chip({ ok, labelOk, labelFail }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${
        ok
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {ok ? "✓" : "✗"} {ok ? labelOk : labelFail}
    </span>
  );
}