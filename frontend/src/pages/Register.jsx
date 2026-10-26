import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Mail, Lock, User, UserPlus, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

export default function Register() {
  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", confirm_password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await register(form.full_name, form.email, form.password, form.confirm_password);
      success("Account created. Welcome to CareerAI!");
      navigate("/app", { replace: true });
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-slate-950">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-slate-900 to-brand-900 text-white relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl" />
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/15 grid place-items-center"><Sparkles className="w-5 h-5" /></div>
          <span className="font-bold">CareerAI</span>
        </Link>
        <div className="relative">
          <h2 className="text-3xl font-bold leading-tight">Start building your career with AI.</h2>
          <p className="mt-3 text-slate-300 max-w-md">Create a free account to analyze your resume, find skill gaps and predict your academic performance.</p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {["Resume Score", "Skill Gaps", "Job Matches", "ML Predictions"].map((x) => (
              <div key={x} className="rounded-xl bg-white/10 px-4 py-3 text-sm">{x}</div>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-400">Your password is securely hashed. We never store it in plain text.</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-brand-600 grid place-items-center text-white"><Sparkles className="w-5 h-5" /></div>
            <span className="font-bold text-slate-800 dark:text-slate-100">CareerAI</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create your account</h1>
          <p className="mt-1 muted">It takes less than a minute.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input required minLength={2} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="input pl-9" placeholder="Aarav Sharma" />
              </div>
            </div>
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
                <input type={show ? "text" : "password"} required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input pl-9 pr-10" placeholder="At least 6 characters" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={show ? "text" : "password"} required minLength={6} value={form.confirm_password} onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                  className="input pl-9" placeholder="Re-enter password" />
              </div>
            </div>
            <button disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Creating account..." : <>Create account <UserPlus className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="mt-6 text-sm muted text-center">
            Already have an account? <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
