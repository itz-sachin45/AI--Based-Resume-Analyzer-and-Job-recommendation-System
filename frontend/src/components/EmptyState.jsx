import { Inbox } from "lucide-react";

export default function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="card p-10 text-center flex flex-col items-center gap-3">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 grid place-items-center text-slate-400">
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="section-title">{title}</p>
        {description && <p className="muted text-sm mt-1 max-w-md">{description}</p>}
      </div>
      {action}
    </div>
  );
}
