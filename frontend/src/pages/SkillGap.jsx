import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Target, Check, X, ArrowRight, Map, FileText } from "lucide-react";
import { getCareers, computeSkillGap } from "../services/careers";
import { getResumes } from "../services/resume";
import Donut from "../components/Donut";
import ProgressBar from "../components/ProgressBar";
import Badge from "../components/Badge";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import { useToast } from "../contexts/ToastContext";

export default function SkillGap() {
  const toast = useToast();
  const [params] = useSearchParams();
  const [resumes, setResumes] = useState([]);
  const [careers, setCareers] = useState([]);
  const [resumeId, setResumeId] = useState(null);
  const [careerId, setCareerId] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    Promise.all([getResumes(), getCareers()])
      .then(([r, c]) => {
        setResumes(r);
        setCareers(c);
        if (r.length) setResumeId(r[0].id);
        const cq = params.get("career");
        if (cq) setCareerId(Number(cq));
        else if (c.length) setCareerId(c[0].id);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const analyze = async () => {
    if (!resumeId || !careerId) { toast.error("Select a resume and a career"); return; }
    setAnalyzing(true);
    try {
      const res = await computeSkillGap(resumeId, careerId);
      setResult(res);
      toast.success(`Career readiness: ${res.readiness}%`);
    } catch (e) { toast.error(e.message); }
    finally { setAnalyzing(false); }
  };

  if (loading) return <Spinner label="Loading..." />;
  if (!resumes.length) return (
    <EmptyState icon={FileText} title="No resume uploaded" description="Upload a resume first to run a skill gap analysis."
      action={<Link to="/app/resume" className="btn-primary mt-2">Upload Resume <ArrowRight className="w-4 h-4" /></Link>} />
  );

  const selectedCareer = careers.find((c) => c.id === careerId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card p-5">
        <h2 className="section-title flex items-center gap-2"><Target className="w-5 h-5 text-brand-500" /> Skill Gap Analysis</h2>
        <p className="muted text-sm mt-1">Compare your latest resume skills against a target career's required skills.</p>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Your resume</label>
            <select value={resumeId || ""} onChange={(e) => setResumeId(Number(e.target.value))} className="input">
              {resumes.map((r) => <option key={r.id} value={r.id}>{r.filename} ({r.score}/100)</option>)}
            </select>
          </div>
          <div>
            <label className="label">Target career</label>
            <select value={careerId || ""} onChange={(e) => setCareerId(Number(e.target.value))} className="input">
              {careers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <button onClick={analyze} disabled={analyzing} className="btn-primary mt-4">
          {analyzing ? <Spinner label="Analyzing..." /> : <>Run Analysis <Target className="w-4 h-4" /></>}
        </button>
      </div>

      {result && (
        <div className="grid lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Readiness donut */}
          <div className="card p-5 flex flex-col items-center justify-center">
            <h3 className="section-title mb-1">Career Readiness</h3>
            <p className="muted text-xs mb-3">{result.career_name}</p>
            <Donut value={result.readiness} size={180} sub="readiness" />
            <p className="mt-4 text-sm muted text-center">
              {result.total_matched} of {result.total_required} required skills matched
            </p>
            <ProgressBar value={result.readiness} className="mt-2 w-full" />
          </div>

          {/* Matched */}
          <div className="card p-5">
            <h3 className="section-title mb-3 flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Skills found ({result.matched_skills.length})</h3>
            {result.matched_skills.length === 0 ? <p className="muted text-sm">No matching skills yet.</p> : (
              <div className="flex flex-wrap gap-2">
                {result.matched_skills.map((s) => <Badge key={s} tone="green"><Check className="w-3 h-3" /> {s}</Badge>)}
              </div>
            )}
          </div>

          {/* Missing */}
          <div className="card p-5">
            <h3 className="section-title mb-3 flex items-center gap-2"><X className="w-4 h-4 text-rose-500" /> Missing skills ({result.missing_skills.length})</h3>
            {result.missing_skills.length === 0 ? <p className="muted text-sm">You meet all required skills!</p> : (
              <div className="flex flex-wrap gap-2">
                {result.missing_skills.map((s) => <Badge key={s} tone="rose"><X className="w-3 h-3" /> {s}</Badge>)}
              </div>
            )}
          </div>
        </div>
      )}

      {result && (
        <div className="card p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm muted">
            {result.readiness >= 75 ? "You're close to job-ready for this role." :
             result.readiness >= 50 ? "Solid progress — close a few gaps to be job-ready." :
             "A focused upskilling plan will boost your readiness significantly."}
          </p>
          <Link to={`/app/roadmap?career=${careerId}`} className="btn-primary">
            <Map className="w-4 h-4" /> Generate Learning Roadmap
          </Link>
        </div>
      )}

      {!result && selectedCareer && (
        <div className="card p-5">
          <p className="text-sm muted">Required skills for <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedCareer.name}</span>:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedCareer.required_skills.map((s) => <Badge key={s} tone="slate">{s}</Badge>)}
          </div>
        </div>
      )}
    </div>
  );
}
