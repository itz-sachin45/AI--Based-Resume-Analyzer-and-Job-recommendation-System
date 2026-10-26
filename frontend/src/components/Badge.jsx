const tones = {
  brand: "badge-brand",
  green: "badge-green",
  amber: "badge-amber",
  rose: "badge-rose",
  slate: "badge-slate",
};

export default function Badge({ children, tone = "slate", className = "" }) {
  return <span className={`badge ${tones[tone] || tones.slate} ${className}`}>{children}</span>;
}
