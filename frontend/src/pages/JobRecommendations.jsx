import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, ArrowRight, FileText, Check, X, TrendingUp, ClipboardList, Search } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { getRecommendations, matchJob } from "../services/jobs";
import { getResumes } from "../services/resume";
import Donut from "../components/Donut";
import Badge from "../components/Badge";
import ProgressBar from "../components/ProgressBar";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import { useToast } from "../contexts/ToastContext";

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "Technical", label: "Technical" },
  { key: "Data", label: "Data" },
  { key: "Business", label: "Business" },
];

export default function JobRecommendations() {
  const toast = useToast();
  const [tab, setTab] = useState("recommendations"); // recommendations | match

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card p-5">
        <h2 className="section-title flex items-center gap-2"><Briefcase className="w-5 h-5 text-brand-500" /> Jobs</h2>
        <p className="muted text-sm mt-1">Match your resume against a job description or browse AI-ranked career recommendations.</p>
        <div className="mt-4 flex gap-2">
          <button onClick={() => setTab("recommendations")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === "recommendations" ? "bg-brand-600 text-white" : "surface text-slate-600 dark:text-slate-300"}`}>
            <Search className="w-4 h-4" /> Recommendations
          </button>
          <button onClick={() => setTab("match")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === "match" ? "bg-brand-600 text-white" : "surface text-slate-600 dark:text-slate-300"}`}>
            <ClipboardList className="w-4 h-4" /> Job Description Match
          </button>
        </div>
      </div>

      {tab === "recommendations" ? <Recommendations toast={toast} /> : <JobMatch toast={toast} />}
    </div>
  );
}

function useResumes(toast) {
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getResumes()
      .then((r) => { setResumes(r); if (r.length) setResumeId(r[0].id); })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return { resumes, resumeId, setResumeId, loading };
}

function NoResume() {
  return (
    <EmptyState icon={FileText} title="No resume uploaded" description="Upload a resume first to use job features."
      action={<Link to="/app/resume" className="btn-primary mt-2">Upload Resume <ArrowRight className="w-4 h-4" /></Link>} />
  );
}

function Recommendations({ toast }) {
  const { resumes, resumeId, setResumeId, loading } = useResumes(toast);
  const [cat, setCat] = useState("all");
  const [recs, setRecs] = useState([]);
  const [fetching, setFetching] = useState(false);

  const load = async (id, category) => {
    if (!id) return;
    setFetching(true);
    try { setRecs(await getRecommendations(id, category === "all" ? undefined : category)); }
    catch (e) { toast.error(e.message); }
    finally { setFetching(false); }
  };

  useEffect(() => { if (resumeId) load(resumeId, cat); }, [resumeId, cat]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <Spinner label="Loading..." />;
  if (!resumes.length) return <NoResume />;

  const chartData = recs.slice(0, 8).map((r) => ({ name: r.role, match: r.match_percentage }));

  return (
    <div className="space-y-6">
      <div className="card p-5 grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Your resume</label>
          <select value={resumeId || ""} onChange={(e) => setResumeId(Number(e.target.value))} className="input">
            {resumes.map((r) => <option key={r.id} value={r.id}>{r.filename}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button key={c.key} onClick={() => setCat(c.key)}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${cat === c.key ? "bg-brand-600 text-white" : "surface text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {fetching ? <Spinner label="Ranking roles..." /> : recs.length === 0 ? (
        <EmptyState icon={Briefcase} title="No recommendations" description="Try a different category." />
      ) : (
        <>
          <div className="card p-5">
            <h3 className="section-title mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-brand-500" /> Match percentage by role</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "rgba(99,102,241,0.08)" }} formatter={(v) => [`${v}%`, "Match"]} />
                  <Bar dataKey="match" radius={[0, 6, 6, 0]}>
                    {chartData.map((d, i) => <Cell key={i} fill={d.match >= 75 ? "#10b981" : d.match >= 50 ? "#6366f1" : d.match >= 30 ? "#f59e0b" : "#f43f5e"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recs.map((r, i) => (
              <div key={r.role} className="card p-5 card-hover animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{r.role}</h3>
                    <Badge tone={r.category === "Technical" ? "brand" : r.category === "Data" ? "violet" : "amber"}>{r.category}</Badge>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${r.match_percentage >= 75 ? "text-emerald-600" : r.match_percentage >= 50 ? "text-brand-600" : "text-amber-600"}`}>{Math.round(r.match_percentage)}%</p>
                    <p className="text-[11px] muted">match</p>
                  </div>
                </div>
                <div className="mt-3"><ProgressBar value={r.match_percentage} tone="auto" /></div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.user_skills.map((s) => <Badge key={"u" + s} tone="green"><Check className="w-3 h-3" />{s}</Badge>)}
                  {r.missing_skills.map((s) => <Badge key={"m" + s} tone="rose"><X className="w-3 h-3" />{s}</Badge>)}
                </div>
                <p className="mt-3 text-xs muted">{r.reason}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function JobMatch({ toast }) {
  const { resumes, resumeId, setResumeId, loading } = useResumes(toast);
  const [jd, setJd] = useState("");
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const run = async () => {
    if (!resumeId) { toast.error("Select a resume"); return; }
    if (!jd.trim()) { toast.error("Paste a job description first"); return; }
    setAnalyzing(true);
    try {
      const r = await matchJob(resumeId, jd);
      setResult(r);
      toast.success(`Job match: ${r.match_score}%`);
    } catch (e) { toast.error(e.message); }
    finally { setAnalyzing(false); }
  };

  if (loading) return <Spinner label="Loading..." />;
  if (!resumes.length) return <NoResume />;

  const d = result?.details || {};

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <div className="mb-4">
          <label className="label">Your resume</label>
          <select value={resumeId || ""} onChange={(e) => setResumeId(Number(e.target.value))} className="input">
            {resumes.map((r) => <option key={r.id} value={r.id}>{r.filename}</option>)}
          </select>
        </div>
        <label className="label">Paste a job description</label>
        <textarea value={jd} onChange={(e) => setJd(e.target.value)} rows={7}
          placeholder="e.g. We need a Java developer with Spring Boot, REST API, MySQL and Git. 1+ years experience. Bachelor degree required."
          className="input resize-y" />
        <button onClick={run} disabled={analyzing} className="btn-primary mt-3">
          {analyzing ? <Spinner label="Matching..." /> : <>Match Resume <ClipboardList className="w-4 h-4" /></>}
        </button>
      </div>

      {analyzing && <div className="card p-6"><Spinner label="Comparing resume with job description..." /></div>}

      {result && !analyzing && (
        <div className="grid lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="card p-5 flex flex-col items-center justify-center">
            <h3 className="section-title mb-3">Job Match Score</h3>
            <Donut value={result.match_score} size={180} sub="overall match" />
            <p className="mt-4 text-xs muted">{result.matched_skills.length} of {result.job_skills.length} required skills matched</p>
          </div>
          <div className="card p-5 lg:col-span-2 space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SubScore label="Overall" value={d.overall_match} />
              <SubScore label="Technical" value={d.technical_skill_match} />
              <SubScore label="Experience" value={d.experience_match} />
              <SubScore label="Education" value={d.education_match} />
            </div>
            <div>
              <h3 className="section-title mb-2 flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Matched skills</h3>
              <div className="flex flex-wrap gap-2">
                {result.matched_skills.length === 0 ? <p className="muted text-sm">None matched.</p> :
                  result.matched_skills.map((s) => <Badge key={s} tone="green"><Check className="w-3 h-3" />{s}</Badge>)}
              </div>
            </div>
            <div>
              <h3 className="section-title mb-2 flex items-center gap-2"><X className="w-4 h-4 text-rose-500" /> Missing skills</h3>
              <div className="flex flex-wrap gap-2">
                {result.missing_skills.length === 0 ? <p className="muted text-sm">No missing skills — great match!</p> :
                  result.missing_skills.map((s) => <Badge key={s} tone="rose"><X className="w-3 h-3" />{s}</Badge>)}
              </div>
            </div>
            {result.suggestions?.length > 0 && (
              <div>
                <h3 className="section-title mb-2">Suggestions</h3>
                <ul className="space-y-1.5">
                  {result.suggestions.map((s, i) => <li key={i} className="text-sm muted flex items-start gap-2"><span className="text-brand-500 mt-1">→</span>{s}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SubScore({ label, value }) {
  const v = value || 0;
  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-center">
      <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{Math.round(v)}%</p>
      <p className="text-[11px] muted">{label}</p>
    </div>
  );
}
