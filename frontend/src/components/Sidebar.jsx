import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, FileText, Compass, Briefcase, Target, Map,
  TrendingUp, History, User, Settings, LogOut, Sparkles,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/resume", label: "Resume Analyzer", icon: FileText },
  { to: "/app/careers", label: "Career Guidance", icon: Compass },
  { to: "/app/jobs", label: "Job Recommendations", icon: Briefcase },
  { to: "/app/skill-gap", label: "Skill Gap Analysis", icon: Target },
  { to: "/app/roadmap", label: "Learning Roadmap", icon: Map },
  { to: "/app/performance", label: "Performance Predictor", icon: TrendingUp },
  { to: "/app/history", label: "Analysis History", icon: History },
];

const BOTTOM = [
  { to: "/app/profile", label: "Profile", icon: User },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? "bg-brand-600 text-white shadow-sm"
        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
    }`;

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-slate-200 dark:border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-brand-600 grid place-items-center text-white">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="leading-tight">
          <p className="font-bold text-slate-800 dark:text-slate-100">CareerAI</p>
          <p className="text-[11px] muted">Guidance Suite</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate} className={linkClass}>
            <item.icon className="w-[18px] h-[18px]" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
        {BOTTOM.map((item) => (
          <NavLink key={item.to} to={item.to} onClick={onNavigate} className={linkClass}>
            <item.icon className="w-[18px] h-[18px]" />
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Logout
        </button>
      </div>

      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800">
        <p className="text-xs muted truncate">Signed in as</p>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{user?.email}</p>
      </div>
    </aside>
  );
}
