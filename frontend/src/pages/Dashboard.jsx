import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText, Target, Briefcase, TrendingUp, AlertTriangle, CheckCircle2,
  Sparkles, ArrowRight, Award, Activity,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from "recharts";
import { getDashboard, getHistory } from "../services/dashboard";
import StatCard from "../components/StatCard";
import Donut from "../components/Donut";
import ProgressBar from "../components/ProgressBar";
import Badge from "../components/Badge";
import { CardSkeleton } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";

const riskTone = { LOW: "green", MEDIUM: "amber", HIGH: "rose" };
const riskColor = { LOW: "#10b981", MEDIUM: "#f59e0b", HIGH: "#f43f5e" };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboard(), getHistory()])
      .then(([d, h]) => { setData(d); setHistory(h); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}</div>;
  }

  if (!data || !data.has_resume) {
    return (
      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={FileText} label="Resume Score" value="—" tone="brand" />
          <StatCard icon={Target} label="Career Readiness" value="—" tone="violet" />
          <StatCard icon={TrendingUp} label="Performance Risk" value="—" tone="green" />
        </div>
        <EmptyState
          icon={FileText}
          title="No resume uploaded yet"
          description="Upload your resume to unlock resume scoring, skill gap analysis, job recommendations and roadmap generation."
          action={<Link to="/app/resume" className="btn-primary mt-2">Upload Resume <ArrowRight className="w-4 h-4" /></Link>}
        />
      </div>
    );
  }

  const techCount = data.skills_detected_list?.length || 0;
  const softCount = data.soft_skills?.length || 0;
  const skillData = [
    { name: "Technical", value: techCount, color: "#6366f1" },
    { name: "Soft", value: softCount, color: "#8b5cf6" },
    { name: "Missing", value: data.missing_skills_count || 0, color: "#f43f5e" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div className="card p-5 lg:p-6 bg-gradient-to-r from-brand-600 to-brand-700 border-0 text-white">
        <div className="flex items-center gap-2 text-brand-100 text-sm"><Sparkles className="w-4 h-4" /> Welcome back</div>
        <h2 className="mt-1 text-xl font-bold">Here's your career snapshot</h2>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={FileText} label="Resume Score" value={`${data.resume_score ?? 0}/100`} sub="From your latest resume" tone="brand" />
        <StatCard icon={Target} label="Career Readiness" value={data.career_readiness != null ? `${data.career_readiness}%` : "—"} sub={data.career_name || "Select a career"} tone="violet" />
        <StatCard icon={CheckCircle2} label="Skills Detected" value={data.skills_detected} sub={`${data.missing_skills_count} improvement areas`} tone="green" />
        <StatCard icon={Briefcase} label="Recommended Jobs" value={data.recommended_jobs} sub="Ranked roles" tone="amber" />
        <StatCard icon={TrendingUp} label="Predicted Performance" value={data.predicted_performance != null ? `${data.predicted_performance}%` : "—"} sub="ML estimate" tone="green" />
        <StatCard
          icon={AlertTriangle}
          label="Performance Risk"
          value={data.performance_risk || "—"}
          sub="Student predictor"
          tone={riskTone[data.performance_risk] || "brand"}
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <h3 className="section-title mb-1">Resume completeness</h3>
          <p className="muted text-sm mb-4">Weighted checklist breakdown — how complete your resume is.</p>
          <div className="space-y-3">
            <MetricRow label="Contact info" value={data.skills_detected > 0 ? 100 : 0} />
            <MetricRow label="Technical skills" value={Math.min((data.skills_detected / 12) * 100, 100)} />
            <MetricRow label="Soft skills" value={Math.min((data.soft_skills?.length / 5) * 100, 100)} />
            <MetricRow label="Improvement areas" value={Math.min((data.missing_skills_count / 6) * 100, 100)} tone="rose" />
          </div>
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Skill distribution</h4>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "rgba(99,102,241,0.08)" }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {skillData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card p-5 flex flex-col items-center justify-center">
          <h3 className="section-title mb-4 text-center">Resume Score</h3>
          <Donut value={data.resume_score ?? 0} size={170} sub="out of 100" />
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {(data.strengths || []).slice(0, 6).map((s) => <Badge key={s} tone="brand">{s}</Badge>)}
          </div>
          {data.career_readiness != null && (
            <p className="mt-4 text-sm muted text-center">
              Career readiness for <span className="font-semibold text-slate-700 dark:text-slate-200">{data.career_name}</span>: {data.career_readiness}%
            </p>
          )}
        </div>
      </div>

      {/* Strengths + recent history */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="section-title mb-3 flex items-center gap-2"><Award className="w-4 h-4 text-brand-500" /> Detected skills</h3>
          <div className="flex flex-wrap gap-2">
            {(data.skills_detected_list || []).length === 0 && <p className="muted text-sm">No skills detected yet.</p>}
            {(data.skills_detected_list || []).map((s) => <Badge key={s} tone="green">{s}</Badge>)}
            {(data.soft_skills || []).map((s) => <Badge key={s} tone="violet">{s}</Badge>)}
          </div>
          {(data.improvements || []).length > 0 && (
            <>
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-5 mb-2">Areas for improvement</h4>
              <ul className="space-y-1.5">
                {data.improvements.slice(0, 5).map((s, i) => (
                  <li key={i} className="text-sm muted flex items-start gap-2">
                    <ArrowRight className="w-3.5 h-3.5 mt-0.5 text-brand-500 shrink-0" />{s}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="card p-5">
          <h3 className="section-title mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-brand-500" /> Recent analyses</h3>
          {history.length === 0 ? <p className="muted text-sm">No analyses yet.</p> : (
            <ul className="space-y-2">
              {history.slice(0, 6).map((h) => (
                <li key={h.id} className="flex items-center justify-between gap-2 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{h.title}</p>
                    <p className="text-xs muted truncate">{h.summary}</p>
                  </div>
                  <Badge tone={h.analysis_type === "performance" ? "amber" : h.analysis_type === "resume" ? "brand" : "slate"}>
                    {h.analysis_type}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          <Link to="/app/history" className="mt-4 text-sm text-brand-600 font-medium hover:underline inline-flex items-center gap-1">
            View all history <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, value, tone = "brand" }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="muted">{label}</span>
        <span className="font-medium text-slate-700 dark:text-slate-200">{Math.round(value)}%</span>
      </div>
      <ProgressBar value={value} tone={tone} />
    </div>
  );
}
