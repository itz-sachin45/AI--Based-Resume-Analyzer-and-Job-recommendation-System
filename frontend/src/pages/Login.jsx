import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Sparkles, Mail, Lock, ArrowRight, LogIn } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

export default function Login() {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      success("Welcome back!");
      const dest = location.state?.from?.pathname || "/app";
      navigate(dest, { replace: true });
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => setForm({ email: "demo@careerguidance.ai", password: "demo1234" });

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-slate-950">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-brand-600 to-brand-800 text-white relative overflow-hidden">
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/15 grid place-items-center"><Sparkles className="w-5 h-5" /></div>
          <span className="font-bold">CareerAI</span>
        </Link>
        <div className="relative">
          <h2 className="text-3xl font-bold leading-tight">Welcome back to your career cockpit.</h2>
          <p className="mt-3 text-brand-100 max-w-md">Resume scores, skill gaps, job recommendations and performance predictions — all in one place.</p>
          <ul className="mt-6 space-y-2 text-brand-100 text-sm">
            <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4" /> AI resume analysis</li>
            <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Career readiness tracking</li>
            <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4" /> ML performance prediction</li>
          </ul>
        </div>
        <p className="text-xs text-brand-200">B.Tech Major Project · Demo: demo@careerguidance.ai / demo1234</p>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-brand-600 grid place-items-center text-white"><Sparkles className="w-5 h-5" /></div>
            <span className="font-bold text-slate-800 dark:text-slate-100">CareerAI</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sign in</h1>
          <p className="mt-1 muted">Enter your credentials to access your dashboard.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input pl-9" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input pl-9" placeholder="••••••••" />
              </div>
            </div>
            <button disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Signing in..." : <>Sign in <LogIn className="w-4 h-4" /></>}
            </button>
          </form>

          <button onClick={fillDemo} className="mt-3 w-full text-sm text-brand-600 hover:text-brand-700 font-medium">
            Use demo credentials
          </button>

          <p className="mt-6 text-sm muted text-center">
            Don't have an account? <Link to="/register" className="text-brand-600 font-semibold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
