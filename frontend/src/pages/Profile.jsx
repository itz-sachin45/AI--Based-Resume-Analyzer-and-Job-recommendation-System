import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User, Mail, ShieldCheck, Award, FileText, Briefcase, Compass, TrendingUp, ArrowRight } from "lucide-react";
import { getResumes } from "../services/resume";
import { getHistory } from "../services/dashboard";
import { useAuth } from "../contexts/AuthContext";
import Badge from "../components/Badge";
import Spinner from "../components/Spinner";

export default function Profile() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getResumes(), getHistory()])
      .then(([r, h]) => { setResumes(r); setHistory(h); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!user) return <Spinner />;

  const counts = {
    resume: history.filter((h) => h.analysis_type === "resume").length,
    job_match: history.filter((h) => h.analysis_type === "job_match").length,
    career: history.filter((h) => h.analysis_type === "career").length,
    performance: history.filter((h) => h.analysis_type === "performance").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card p-6 flex flex-col sm:flex-row items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-brand-100 dark:bg-brand-500/20 grid place-items-center text-brand-700 dark:text-brand-300 text-3xl font-bold">
          {user.full_name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{user.full_name}</h2>
          <p className="muted text-sm flex items-center justify-center sm:justify-start gap-1.5"><Mail className="w-3.5 h-3.5" /> {user.email}</p>
          <div className="mt-2 flex justify-center sm:justify-start gap-2">
            {user.is_demo && <Badge tone="amber">Demo account</Badge>}
            <Badge tone="green"><ShieldCheck className="w-3 h-3" /> Verified</Badge>
          </div>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FileText} label="Resumes" value={resumes.length} tone="brand" />
          <StatCard icon={Compass} label="Career analyses" value={counts.career} tone="violet" />
          <StatCard icon={Briefcase} label="Job matches" value={counts.job_match} tone="amber" />
          <StatCard icon={TrendingUp} label="Predictions" value={counts.performance} tone="green" />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="section-title mb-3 flex items-center gap-2"><Award className="w-4 h-4 text-brand-500" /> Account</h3>
          <dl className="space-y-2 text-sm">
            <Row label="Full name" value={user.full_name} />
            <Row label="Email" value={user.email} />
            <Row label="Account type" value={user.is_demo ? "Demo" : "Standard"} />
          </dl>
        </div>
        <div className="card p-5">
          <h3 className="section-title mb-3 flex items-center gap-2"><User className="w-4 h-4 text-brand-500" /> Quick links</h3>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/app/resume" className="btn-secondary text-sm !py-2">Resume Analyzer</Link>
            <Link to="/app/careers" className="btn-secondary text-sm !py-2">Career Guidance</Link>
            <Link to="/app/skill-gap" className="btn-secondary text-sm !py-2">Skill Gap</Link>
            <Link to="/app/performance" className="btn-secondary text-sm !py-2">Predictor</Link>
          </div>
          <Link to="/app/settings" className="mt-3 text-sm text-brand-600 font-medium hover:underline inline-flex items-center gap-1">
            Open settings <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  const toneCls = {
    brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300",
    violet: "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
    green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  }[tone];
  return (
    <div className="card p-5 card-hover">
      <div className={`w-11 h-11 rounded-xl grid place-items-center mb-3 ${toneCls}`}><Icon className="w-5 h-5" /></div>
      <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
      <p className="text-sm muted">{label}</p>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <dt className="muted">{label}</dt>
      <dd className="font-medium text-slate-700 dark:text-slate-200">{value}</dd>
    </div>
  );
}
