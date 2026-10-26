import { useEffect, useState } from "react";
import { History as HistoryIcon, FileText, Briefcase, Compass, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { getHistory } from "../services/dashboard";
import Badge from "../components/Badge";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";

const FILTERS = [
  { key: "all", label: "All", icon: HistoryIcon },
  { key: "resume", label: "Resume", icon: FileText },
  { key: "job_match", label: "Job Match", icon: Briefcase },
  { key: "career", label: "Career", icon: Compass },
  { key: "performance", label: "Performance", icon: TrendingUp },
];

const typeIcon = { resume: FileText, job_match: Briefcase, career: Compass, performance: TrendingUp };
const typeTone = { resume: "brand", job_match: "amber", career: "violet", performance: "rose" };

export default function History() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState({});

  useEffect(() => {
    getHistory()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? items : items.filter((i) => i.analysis_type === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card p-5">
        <h2 className="section-title flex items-center gap-2"><HistoryIcon className="w-5 h-5 text-brand-500" /> Analysis History</h2>
        <p className="muted text-sm mt-1">Every analysis you run is saved with a timestamp so you can track your progress over time.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${filter === f.key ? "bg-brand-600 text-white" : "surface text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
              <f.icon className="w-4 h-4" /> {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? <Spinner label="Loading history..." /> : filtered.length === 0 ? (
        <EmptyState icon={HistoryIcon} title="No history yet" description="Run some analyses to start building your history." />
      ) : (
        <div className="card divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.map((h) => {
            const Icon = typeIcon[h.analysis_type] || HistoryIcon;
            const expanded = open[h.id];
            return (
              <div key={h.id} className="p-4">
                <button onClick={() => setOpen({ ...open, [h.id]: !expanded })}
                  className="w-full flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 grid place-items-center text-slate-500 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{h.title}</p>
                    <p className="text-xs muted truncate">{h.summary}</p>
                  </div>
                  <div className="hidden sm:block text-xs muted">{h.created_at}</div>
                  <Badge tone={typeTone[h.analysis_type] || "slate"}>{h.analysis_type}</Badge>
                  {Object.keys(h.details || {}).length > 0 && (expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />)}
                </button>
                {expanded && Object.keys(h.details || {}).length > 0 && (
                  <pre className="mt-3 ml-12 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs muted overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(h.details, null, 2)}
                  </pre>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
