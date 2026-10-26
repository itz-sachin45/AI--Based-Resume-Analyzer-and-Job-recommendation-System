import { Sun, Moon, Info, LogOut, ShieldCheck, Database, Github } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { success } = useToast();

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="card p-5">
        <h2 className="section-title">Appearance</h2>
        <p className="muted text-sm mt-1">Choose how CareerAI looks to you.</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 grid place-items-center">
              {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-medium text-slate-700 dark:text-slate-200">Theme</p>
              <p className="text-xs muted">Currently in {theme} mode</p>
            </div>
          </div>
          <button onClick={() => { toggleTheme(); success(`Switched to ${theme === "dark" ? "light" : "dark"} mode`); }} className="btn-secondary">
            Switch to {theme === "dark" ? "light" : "dark"}
          </button>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="section-title">Account</h2>
        <p className="muted text-sm mt-1">Your account information.</p>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
            <dt className="muted">Name</dt><dd className="font-medium text-slate-700 dark:text-slate-200">{user?.full_name}</dd>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
            <dt className="muted">Email</dt><dd className="font-medium text-slate-700 dark:text-slate-200">{user?.email}</dd>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <dt className="muted">Type</dt><dd className="font-medium text-slate-700 dark:text-slate-200">{user?.is_demo ? "Demo account" : "Standard account"}</dd>
          </div>
        </dl>
      </div>

      <div className="card p-5">
        <h2 className="section-title flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-brand-500" /> Security</h2>
        <ul className="mt-3 space-y-2 text-sm muted">
          <li className="flex items-start gap-2"><Info className="w-4 h-4 mt-0.5 text-brand-500 shrink-0" /> Passwords are hashed with bcrypt and never stored in plain text.</li>
          <li className="flex items-start gap-2"><Info className="w-4 h-4 mt-0.5 text-brand-500 shrink-0" /> Authentication uses JWT bearer tokens.</li>
          <li className="flex items-start gap-2"><Database className="w-4 h-4 mt-0.5 text-brand-500 shrink-0" /> All database access uses parameterized queries via SQLAlchemy.</li>
        </ul>
      </div>

      <div className="card p-5">
        <h2 className="section-title">About</h2>
        <p className="muted text-sm mt-1">AI-Powered Career Guidance, Resume Analyzer & Student Performance Prediction System.</p>
        <div className="mt-3 flex items-center gap-2 text-sm muted">
          <Github className="w-4 h-4" /> B.Tech Major Project · React · FastAPI · MySQL · scikit-learn
        </div>
      </div>

      <div className="card p-5 border-rose-200 dark:border-rose-500/30">
        <h2 className="section-title text-rose-600 dark:text-rose-400">Danger zone</h2>
        <p className="muted text-sm mt-1">Sign out of your account on this device.</p>
        <button onClick={logout} className="btn-danger mt-3"><LogOut className="w-4 h-4" /> Logout</button>
      </div>
    </div>
  );
}
