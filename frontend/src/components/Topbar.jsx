import { Menu, Sparkles } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../contexts/AuthContext";
import Badge from "./Badge";

export default function Topbar({ onMenu, title }) {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between gap-3 px-4 md:px-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="btn-ghost !p-2 lg:hidden" aria-label="Open menu">
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {user?.is_demo && <Badge tone="amber">Demo account</Badge>}
        <ThemeToggle />
        <div className="hidden sm:flex items-center gap-2 pl-2 ml-1 border-l border-slate-200 dark:border-slate-800">
          <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-500/20 grid place-items-center text-brand-700 dark:text-brand-300 font-semibold">
            {(user?.full_name || "U").charAt(0).toUpperCase()}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.full_name}</p>
            <p className="text-[11px] muted">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
