import { Loader2 } from "lucide-react";

export default function Spinner({ label = "Loading...", className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-10 text-slate-500 dark:text-slate-400 ${className}`}>
      <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function FullPageSpinner() {
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <Spinner label="Please wait..." />
    </div>
  );
}
