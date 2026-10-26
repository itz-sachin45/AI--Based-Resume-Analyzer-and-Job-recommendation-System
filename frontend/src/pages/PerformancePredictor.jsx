import { useEffect, useState } from "react";
import { TrendingUp, Brain, AlertTriangle, CheckCircle2, Lightbulb, Plus, Trash2, Info, Activity } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { predictPerformance, getModelInfo } from "../services/performance";
import Donut from "../components/Donut";
import Badge from "../components/Badge";
import Spinner from "../components/Spinner";
import { useToast } from "../contexts/ToastContext";

const FIELDS = [
  { key: "attendance", label: "Attendance %", min: 0, max: 100, step: 1, default: 75 },
  { key: "internal_marks", label: "Internal Marks %", min: 0, max: 100, step: 1, default: 65 },
  { key: "prev_semester", label: "Previous Semester %", min: 0, max: 100, step: 1, default: 70 },
  { key: "assignment_score", label: "Assignment Score %", min: 0, max: 100, step: 1, default: 70 },
  { key: "study_hours", label: "Study Hours (per day)", min: 0, max: 24, step: 0.5, default: 3 },
];

const riskTone = { LOW: "green", MEDIUM: "amber", HIGH: "rose" };
const riskColor = { LOW: "#10b981", MEDIUM: "#f59e0b", HIGH: "#f43f5e" };

export default function PerformancePredictor() {
  const toast = useToast();
  const [form, setForm] = useState(Object.fromEntries(FIELDS.map((f) => [f.key, f.default])));
  const [subjects, setSubjects] = useState([{ name: "Maths", mark: 70 }]);
  const [result, setResult] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { getModelInfo().then(setModelInfo).catch(() => {}); }, []);

  const predict = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const subjectMarks = {};
      subjects.forEach((s) => { if (s.name) subjectMarks[s.name] = Number(s.mark); });
      const res = await predictPerformance({ ...form, subject_marks: subjectMarks });
      setResult(res);
      toast.success(`Predicted performance: ${res.predicted_performance}% (${res.risk_level} risk)`);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const inputChartData = FIELDS.filter((f) => f.key !== "study_hours").map((f) => ({
    name: f.label.replace(" %", "").replace(" (per day)", ""),
    value: Number(form[f.key]),
  }));
  inputChartData.push({ name: "Study (x10)", value: Number(form.study_hours) * 10 });

  const subjectData = subjects.filter((s) => s.name).map((s) => ({ subject: s.name, mark: Number(s.mark) }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card p-5 bg-gradient-to-r from-brand-600 to-brand-700 border-0 text-white">
        <div className="flex items-center gap-2 text-brand-100 text-sm"><TrendingUp className="w-4 h-4" /> Student Performance Predictor</div>
        <h2 className="mt-1 text-xl font-bold">Predict academic performance with machine learning</h2>
        <p className="mt-1 text-brand-100 text-sm">A trained scikit-learn model estimates your performance and risk level from your academic inputs.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input form */}
        <form onSubmit={predict} className="card p-5 lg:col-span-1 space-y-4">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <div className="flex items-center justify-between">
                <label className="label !mb-1">{f.label}</label>
                <span className="text-sm font-semibold text-brand-600">{form[f.key]}{f.key === "study_hours" ? "h" : "%"}</span>
              </div>
              <input type="range" min={f.min} max={f.max} step={f.step} value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: Number(e.target.value) })}
                className="w-full accent-brand-600" />
            </div>
          ))}

          <div>
            <label className="label flex items-center gap-2"><Plus className="w-3.5 h-3.5" /> Optional subject-wise marks</label>
            <div className="space-y-2">
              {subjects.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input value={s.name} onChange={(e) => setSubjects(subjects.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                    placeholder="Subject" className="input !py-2" />
                  <input type="number" min={0} max={100} value={s.mark}
                    onChange={(e) => setSubjects(subjects.map((x, j) => j === i ? { ...x, mark: e.target.value } : x))}
                    className="input !py-2 w-24" />
                  <button type="button" onClick={() => setSubjects(subjects.filter((_, j) => j !== i))}
                    className="btn-ghost !p-2 text-rose-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <button type="button" onClick={() => setSubjects([...subjects, { name: "", mark: 70 }])}
                className="btn-secondary !py-1.5 text-sm w-full">Add subject</button>
            </div>
          </div>

          <button disabled={loading} className="btn-primary w-full">
            {loading ? <Spinner label="Predicting..." /> : <>Predict Performance <TrendingUp className="w-4 h-4" /></>}
          </button>
        </form>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? <div className="card p-6"><Spinner label="Running ML model..." /></div> :
           !result ? (
            <div className="card p-10 text-center flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-500/15 text-brand-600 grid place-items-center"><Brain className="w-7 h-7" /></div>
              <h3 className="section-title">Ready when you are</h3>
              <p className="muted text-sm max-w-sm">Adjust the sliders and run the predictor to see your estimated performance, risk level and personalized suggestions.</p>
            </div>
          ) : (
            <>
              {/* Headline result */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="card p-5 flex flex-col items-center">
                  <h3 className="section-title mb-3">Predicted Performance</h3>
                  <Donut value={result.predicted_performance} size={170} sub="estimated" />
                </div>
                <div className="card p-5 flex flex-col items-center justify-center">
                  <h3 className="section-title mb-3">Performance Risk</h3>
                  <div className={`w-24 h-24 rounded-2xl grid place-items-center mb-3 ${result.risk_level === "LOW" ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600" : result.risk_level === "MEDIUM" ? "bg-amber-100 dark:bg-amber-500/15 text-amber-600" : "bg-rose-100 dark:bg-rose-500/15 text-rose-600"}`}>
                    {result.risk_level === "LOW" ? <CheckCircle2 className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
                  </div>
                  <Badge tone={riskTone[result.risk_level]}>{result.risk_level} RISK</Badge>
                  <p className="mt-3 text-xs muted">Model: {result.model_used}</p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="card p-5">
                  <h3 className="section-title mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-brand-500" /> Input metrics</h3>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={inputChartData}>
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: "rgba(99,102,241,0.08)" }} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {inputChartData.map((d, i) => <Cell key={i} fill={d.value >= 75 ? "#10b981" : d.value >= 50 ? "#6366f1" : "#f59e0b"} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="card p-5">
                  <h3 className="section-title mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-brand-500" /> Subject performance</h3>
                  {subjectData.length === 0 ? <p className="muted text-sm">Add subjects to see a subject breakdown.</p> : (
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={subjectData} outerRadius="70%">
                          <PolarGrid stroke="#e2e8f0" className="dark:!stroke-slate-700" />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                          <Radar dataKey="mark" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>

              {/* Factors + suggestions */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="card p-5">
                  <h3 className="section-title mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Key factors</h3>
                  <ul className="space-y-2">
                    {result.factors.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                        <span className={`w-2 h-2 rounded-full ${f === "Strong Academic Profile" ? "bg-emerald-500" : "bg-amber-500"}`} />{f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card p-5">
                  <h3 className="section-title mb-3 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-brand-500" /> Suggestions</h3>
                  <ul className="space-y-2">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="text-sm muted flex items-start gap-2"><span className="text-brand-500 mt-1">→</span>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="card p-4 flex items-start gap-2 bg-amber-50/60 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20">
                <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs muted">Predictions are estimates generated by a machine-learning model based on the inputs and available training data. They are indicative, not definitive.</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Model info */}
      {modelInfo && (
        <div className="card p-5">
          <h3 className="section-title mb-3 flex items-center gap-2"><Brain className="w-4 h-4 text-brand-500" /> Model information</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="Best model" value={modelInfo.best_model} />
            <Stat label="Dataset rows" value={modelInfo.dataset_rows} />
            <Stat label="R² score" value={modelInfo.metrics[modelInfo.best_model]?.r2} />
            <Stat label="MAE" value={modelInfo.metrics[modelInfo.best_model]?.mae} />
          </div>
          <p className="muted text-xs mt-3">All models evaluated: {Object.entries(modelInfo.metrics).map(([k, v]) => `${k} (R² ${v.r2}, MAE ${v.mae})`).join(" · ")}</p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
      <p className="text-xs muted">{label}</p>
      <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{value ?? "—"}</p>
    </div>
  );
}
