export default function StatCard({ icon: Icon, label, value, sub, tone = "brand" }) {
  const toneCls = {
    brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300",
    green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
    violet: "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  }[tone];
  return (
    <div className="card p-5 card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm muted">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
          {sub && <p className="mt-1 text-xs muted">{sub}</p>}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl grid place-items-center ${toneCls}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
