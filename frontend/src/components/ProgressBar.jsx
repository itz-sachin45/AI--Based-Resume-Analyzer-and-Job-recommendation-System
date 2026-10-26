const toneMap = {
  brand: "bg-brand-600",
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
};

export default function ProgressBar({ value = 0, max = 100, tone = "brand", height = "h-2.5", showLabel = false, className = "" }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const auto = pct >= 75 ? "green" : pct >= 50 ? "brand" : pct >= 30 ? "amber" : "rose";
  const cls = tone === "auto" ? toneMap[auto] : toneMap[tone] || toneMap.brand;
  return (
    <div className={className}>
      <div className={`progress-track ${height}`}>
        <div className={`h-full rounded-full ${cls} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <div className="mt-1 text-xs muted">{Math.round(pct)}%</div>}
    </div>
  );
}
