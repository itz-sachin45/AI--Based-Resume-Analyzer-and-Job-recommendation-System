import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  UploadCloud, FileText, Mail, Phone, GraduationCap, Briefcase, FolderGit2,
  Award, CheckCircle2, AlertCircle, Lightbulb, Download, History as HistoryIcon,
} from "lucide-react";
import { uploadResume, getResumes, getResume } from "../services/resume";
import Donut from "../components/Donut";
import Badge from "../components/Badge";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import { useToast } from "../contexts/ToastContext";

export default function ResumeAnalyzer() {
  const toast = useToast();
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getResumes().then(setHistory).catch(() => {});
  }, []);

  const handleFile = async (file) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith(".pdf") && !name.endsWith(".docx")) {
      toast.error("Only PDF or DOCX files are supported");
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      toast.error("File is too large (max 6MB)");
      return;
    }
    setLoading(true);
    try {
      const data = await uploadResume(file);
      setResult(data);
      toast.success(`Resume analyzed — score ${data.score}/100`);
      getResumes().then(setHistory);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const viewHistory = async (id) => {
    getResume(id).then(setResult).catch((e) => toast.error(e.message));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
        className={`card p-8 border-2 border-dashed transition-colors ${drag ? "border-brand-500 bg-brand-50/40 dark:bg-brand-500/5" : "border-slate-300 dark:border-slate-700"}`}
      >
        <input ref={inputRef} type="file" accept=".pdf,.docx" className="hidden"
          onChange={(e) => handleFile(e.target.files[0])} />
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-500/15 text-brand-600 grid place-items-center mb-4">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h3 className="section-title">Upload your resume</h3>
          <p className="muted text-sm mt-1 max-w-md">Drag & drop a PDF or DOCX file here, or click to browse. We extract skills, projects, experience and certifications with NLP.</p>
          <button onClick={() => inputRef.current?.click()} disabled={loading} className="btn-primary mt-5">
            {loading ? <Spinner label="Analyzing..." /> : <>Choose file <FileText className="w-4 h-4" /></>}
          </button>
          <p className="mt-3 text-xs muted">Max 6MB · PDF or DOCX</p>
        </div>
      </div>

      {loading && <div className="card p-6"><Spinner label="Extracting skills and scoring resume..." /></div>}

      {result && !loading && <ResultCard data={result} />}

      {!result && !loading && history.length > 0 && (
        <div className="card p-5">
          <h3 className="section-title mb-3 flex items-center gap-2"><HistoryIcon className="w-4 h-4 text-brand-500" /> Previous resumes</h3>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {history.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 grid place-items-center text-slate-500"><FileText className="w-4 h-4" /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{r.filename}</p>
                    <p className="text-xs muted">{r.created_at} · {r.technical_skills?.length || 0} skills</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone="brand">{r.score}/100</Badge>
                  <button onClick={() => viewHistory(r.id)} className="btn-ghost text-sm !py-1.5">View</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!result && !loading && history.length === 0 && (
        <EmptyState icon={FileText} title="No analyses yet" description="Upload your first resume to see a detailed breakdown and score." />
      )}
    </div>
  );
}

function ResultCard({ data }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Score + contact */}
        <div className="card p-5 flex flex-col items-center">
          <h3 className="section-title mb-3">Resume Score</h3>
          <Donut value={data.score} size={170} sub="out of 100" />
          <div className="mt-4 w-full space-y-1.5 text-sm">
            <Info icon={Mail} label="Email" value={data.email} />
            <Info icon={Phone} label="Phone" value={data.phone} />
            <Info icon={FileText} label="Name" value={data.name} />
          </div>
        </div>

        {/* Strengths / improvements */}
        <div className="card p-5 lg:col-span-2 space-y-5">
          <div>
            <h3 className="section-title mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Strengths</h3>
            <div className="flex flex-wrap gap-2">
              {(data.strengths || []).length === 0 ? <p className="muted text-sm">No strengths detected.</p> :
                data.strengths.map((s) => <Badge key={s} tone="green">{s}</Badge>)}
            </div>
          </div>
          <div>
            <h3 className="section-title mb-3 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-500" /> Areas for improvement</h3>
            <ul className="space-y-1.5">
              {(data.improvements || []).length === 0 ? <p className="muted text-sm">No improvement areas flagged.</p> :
                data.improvements.map((s, i) => (
                  <li key={i} className="text-sm muted flex items-start gap-2"><span className="text-amber-500 mt-1">•</span>{s}</li>
                ))}
            </ul>
          </div>
          <div>
            <h3 className="section-title mb-3 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-brand-500" /> Suggestions</h3>
            <ul className="space-y-1.5">
              {(data.suggestions || []).map((s, i) => (
                <li key={i} className="text-sm muted flex items-start gap-2"><span className="text-brand-500 mt-1">→</span>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Extracted details */}
      <div className="grid md:grid-cols-2 gap-4">
        <Section icon={GraduationCap} title="Education" items={data.education} />
        <Section icon={Briefcase} title="Experience" items={data.experience} />
        <Section icon={FolderGit2} title="Projects" items={data.projects} />
        <Section icon={Award} title="Certifications" items={data.certifications} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <SkillGroup title="Technical Skills" skills={data.technical_skills} tone="brand" />
        <SkillGroup title="Soft Skills" skills={data.soft_skills} tone="violet" />
      </div>

      <div className="card p-5 bg-brand-50/60 dark:bg-brand-500/10 border-brand-200 dark:border-brand-500/20">
        <p className="text-sm text-slate-700 dark:text-slate-200">
          Next: head to <Link to="/app/careers" className="font-semibold text-brand-600 hover:underline">Career Guidance</Link> to pick a target role, or
          <Link to="/app/skill-gap" className="font-semibold text-brand-600 hover:underline ml-1">analyze your skill gap</Link>.
        </p>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <span className="muted w-16">{label}</span>
      <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{value || "—"}</span>
    </div>
  );
}

function Section({ icon: Icon, title, items }) {
  return (
    <div className="card p-5">
      <h3 className="section-title mb-3 flex items-center gap-2"><Icon className="w-4 h-4 text-brand-500" /> {title}</h3>
      {(items || []).length === 0 ? <p className="muted text-sm">Not detected.</p> : (
        <ul className="space-y-2">
          {items.map((it, i) => <li key={i} className="text-sm text-slate-700 dark:text-slate-200">{it}</li>)}
        </ul>
      )}
    </div>
  );
}

function SkillGroup({ title, skills, tone }) {
  return (
    <div className="card p-5">
      <h3 className="section-title mb-3">{title} <span className="muted text-sm font-normal">({(skills || []).length})</span></h3>
      <div className="flex flex-wrap gap-2">
        {(skills || []).length === 0 ? <p className="muted text-sm">None detected.</p> :
          skills.map((s) => <Badge key={s} tone={tone}>{s}</Badge>)}
      </div>
    </div>
  );
}
