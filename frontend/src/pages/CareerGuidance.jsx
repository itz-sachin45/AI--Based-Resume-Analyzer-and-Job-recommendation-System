import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Compass, Check, ArrowRight, Map, Target, Search } from "lucide-react";
import { getCareers } from "../services/careers";
import Badge from "../components/Badge";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import { useToast } from "../contexts/ToastContext";

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "Technical", label: "Technical" },
  { key: "Data", label: "Data" },
  { key: "Business", label: "Business" },
];

const toneByCat = { Technical: "brand", Data: "violet", Business: "amber" };

export default function CareerGuidance() {
  const toast = useToast();
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("all");
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getCareers()
      .then(setCareers)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = careers.filter((c) => {
    const matchCat = cat === "all" || c.category === cat;
    const matchQ = !query || c.name.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card p-5 bg-gradient-to-r from-brand-600 to-brand-700 border-0 text-white">
        <div className="flex items-center gap-2 text-brand-100 text-sm"><Compass className="w-4 h-4" /> Career Guidance</div>
        <h2 className="mt-1 text-xl font-bold">What do you want to become?</h2>
        <p className="mt-1 text-brand-100 text-sm">Pick a target career to see required skills, run a skill-gap analysis and generate a learning roadmap.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c.key} onClick={() => setCat(c.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                cat === c.key ? "bg-brand-600 text-white" : "surface text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search careers..." className="input pl-9" />
        </div>
      </div>

      {loading ? <Spinner label="Loading careers..." /> : filtered.length === 0 ? (
        <EmptyState icon={Compass} title="No careers found" description="Try a different category or search term." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c, i) => (
            <button key={c.id} onClick={() => setSelected(c)}
              className={`card p-5 text-left card-hover animate-fade-in-up ${selected?.id === c.id ? "ring-2 ring-brand-500" : ""}`}
              style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex items-center justify-between">
                <Badge tone={toneByCat[c.category] || "slate"}>{c.category}</Badge>
                {selected?.id === c.id && <Check className="w-4 h-4 text-brand-500" />}
              </div>
              <h3 className="mt-3 font-semibold text-slate-800 dark:text-slate-100">{c.name}</h3>
              <p className="mt-1 text-xs muted line-clamp-2">{c.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(c.required_skills || []).slice(0, 5).map((s) => <Badge key={s} tone="slate">{s.split("/")[0]}</Badge>)}
                {(c.required_skills || []).length > 5 && <Badge tone="slate">+{c.required_skills.length - 5}</Badge>}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Selected career detail */}
      {selected && (
        <div className="card p-6 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{selected.name}</h3>
              <p className="muted text-sm mt-1">{selected.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to={`/app/skill-gap?career=${selected.id}`} className="btn-primary"><Target className="w-4 h-4" /> Skill Gap Analysis</Link>
              <Link to={`/app/roadmap?career=${selected.id}`} className="btn-secondary"><Map className="w-4 h-4" /> Learning Roadmap</Link>
            </div>
          </div>
          <div className="mt-5">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Required skills</p>
            <div className="flex flex-wrap gap-2">
              {selected.required_skills.map((s) => <Badge key={s} tone="brand">{s}</Badge>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
