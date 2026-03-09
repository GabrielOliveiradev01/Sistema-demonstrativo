"use client";

type Props = {
  percentual: number;
  label?: string;
  size?: number;
};

export function IndicadorCircularMeta({
  percentual,
  label = "Meta",
  size = 120,
}: Props) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const stroke = (percentual / 100) * circ;
  const cor =
    percentual >= 90 ? "#22c55e" : percentual >= 70 ? "#eab308" : "#dc2626";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={cor}
          strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={circ - stroke}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="text-center">
        <p className="text-2xl font-bold" style={{ color: cor }}>
          {percentual.toFixed(0)}%
        </p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}
