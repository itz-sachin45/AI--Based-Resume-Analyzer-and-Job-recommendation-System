import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useTheme } from "../contexts/ThemeContext";

/**
 * Lightweight donut showing a single percentage (e.g. readiness / match).
 * `value` is 0..100; the remaining portion is rendered as a muted track.
 */
export default function Donut({ value = 0, size = 150, label = "", sub = "" }) {
  const { theme } = useTheme();
  const v = Math.max(0, Math.min(100, value));
  const tone = v >= 75 ? "#10b981" : v >= 50 ? "#6366f1" : v >= 30 ? "#f59e0b" : "#f43f5e";
  const track = theme === "dark" ? "#1e293b" : "#e2e8f0";
  const data = [
    { name: "value", value: v },
    { name: "rest", value: 100 - v },
  ];
  const colors = [tone, track];

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={size * 0.32}
            outerRadius={size * 0.46}
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 grid place-items-center text-center pointer-events-none">
        <div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{Math.round(v)}{label || "%"}</div>
          {sub && <div className="text-[11px] muted">{sub}</div>}
        </div>
      </div>
    </div>
  );
}
