import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext();

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const notify = useCallback((message, type = "info", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    if (duration) setTimeout(() => remove(id), duration);
  }, [remove]);

  const success = (m) => notify(m, "success");
  const error = (m) => notify(m, "error", 5000);
  const info = (m) => notify(m, "info");

  return (
    <ToastContext.Provider value={{ notify, success, error, info }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[min(92vw,360px)]">
        {toasts.map((t) => {
          const Icon = icons[t.type] || Info;
          const tone =
            t.type === "success" ? "text-emerald-500"
            : t.type === "error" ? "text-rose-500"
            : "text-brand-500";
          return (
            <div key={t.id} className="card px-4 py-3 flex items-start gap-3 animate-fade-in-up shadow-soft">
              <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${tone}`} />
              <p className="text-sm text-slate-700 dark:text-slate-200 flex-1">{t.message}</p>
              <button onClick={() => remove(t.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
