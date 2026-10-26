import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Map, ArrowRight, FileText, Circle, CircleDot, CheckCircle2, Flag } from "lucide-react";
import { getCareers, getRoadmap, updateRoadmapProgress } from "../services/careers";
import { getResumes } from "../services/resume";
import Badge from "../components/Badge";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import { useToast } from "../contexts/ToastContext";

const STATUSES = ["not_started", "learning", "completed"];
const STATUS_META = {
  not_started: { label: "Not Started", icon: Circle, tone: "slate" },
  learning: { label: "Learning", icon: CircleDot, tone: "amber" },
  completed: { label: "Completed", icon: CheckCircle2, tone: "green" },
};

export default function LearningRoadmap() {
  const toast = useToast();
  const [params] = useSearchParams();
  const [resumes, setResumes] = useState([]);
  const [careers, setCareers] = useState([]);
  const [careerId, setCareerId] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  const load = async (id) => {
    if (!id) return;
    setFetching(true);
    try {
      const r = await getRoadmap(id);
      setRoadmap(r);
    } catch (e) { toast.error(e.message); }
    finally { setFetching(false); }
  };

  useEffect(() => {
    Promise.all([getResumes(), getCareers()])
      .then(([r, c]) => {
        setResumes(r); setCareers(c);
        const cq = params.get("career");
        setCareerId(cq ? Number(cq) : (c.length ? c[0].id : null));
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (careerId) load(careerId); }, [careerId]); // eslint-disable-line react-hooks/exhaustive-deps

  const cycleStatus = async (skill, current, stage) => {
    const idx = STATUSES.indexOf(current);
    const next = STATUSES[(idx + 1) % STATUSES.length];
    // optimistic update
    setRoadmap((prev) => prev && ({
      ...prev,
      stages: prev.stages.map((s) => ({
        ...s,
        skills: s.skills.map((sk) => sk.skill === skill ? { ...sk, status: next } : sk),
      })),
    }));
    try {
      await updateRoadmapProgress(careerId, skill, next, stage);
      toast.success(`${skill}: ${STATUS_META[next].label}`);
    } catch (e) {
      toast.error(e.message);
      load(careerId);
    }
  };

  if (loading) return <Spinner label="Loading..." />;
  if (!resumes.length) return (
    <EmptyState icon={FileText} title="No resume uploaded" description="Upload a resume first to generate a personalized learning roadmap."
      action={<Link to="/app/resume" className="btn-primary mt-2">Upload Resume <ArrowRight className="w-4 h-4" /></Link>} />
  );

  // overall progress
  const allSkills = roadmap?.stages.flatMap((s) => s.skills) || [];
  const completed = allSkills.filter((s) => s.status === "completed").length;
  const pct = allSkills.length ? Math.round((completed / allSkills.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card p-5 bg-gradient-to-r from-brand-600 to-brand-700 border-0 text-white">
        <div className="flex items-center gap-2 text-brand-100 text-sm"><Map className="w-4 h-4" /> Learning Roadmap</div>
        <h2 className="mt-1 text-xl font-bold">Your personalized path to job-ready</h2>
        <p className="mt-1 text-brand-100 text-sm">Click any skill to cycle its status: Not Started → Learning → Completed.</p>
      </div>

      <div className="card p-5 flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
        <div className="sm:w-72">
          <label className="label">Target career</label>
          <select value={careerId || ""} onChange={(e) => setCareerId(Number(e.target.value))} className="input">
            {careers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="text-center">
          <p className="text-sm muted">Overall progress</p>
          <p className="text-2xl font-bold text-brand-600">{pct}%</p>
          <div className="progress-track w-48 mt-1"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
        </div>
      </div>

      {fetching ? <Spinner label="Building roadmap..." /> : !roadmap ? (
        <EmptyState icon={Map} title="No roadmap" description="Select a career to generate a roadmap." />
      ) : (
        <div className="space-y-4">
          {roadmap.stages.map((stage) => (
            <div key={stage.stage} className="card p-5 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/15 text-brand-600 grid place-items-center font-bold">
                  {stage.stage}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">Stage {stage.stage} — {stage.label}</h3>
                  <Badge tone="brand">{stage.level}</Badge>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {stage.skills.map((sk) => {
                  const meta = STATUS_META[sk.status] || STATUS_META.not_started;
                  const Icon = meta.icon;
                  return (
                    <button key={sk.skill} onClick={() => cycleStatus(sk.skill, sk.status, stage.stage)}
                      className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border transition-colors text-left ${
                        sk.status === "completed" ? "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-500/10"
                        : sk.status === "learning" ? "border-amber-200 dark:border-amber-500/30 bg-amber-50/60 dark:bg-amber-500/10"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{sk.skill}</span>
                      <span className="flex items-center gap-1.5 text-xs muted">
                        <Icon className={`w-4 h-4 ${sk.status === "completed" ? "text-emerald-500" : sk.status === "learning" ? "text-amber-500" : "text-slate-400"}`} />
                        {meta.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card p-5 flex items-center justify-center gap-2 text-sm muted">
        <Flag className="w-4 h-4 text-brand-500" /> Roadmap progress is saved to your account and persists across sessions.
      </div>
    </div>
  );
}
