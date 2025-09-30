import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const ToastContext = createContext(null);

let idSeq = 1;

export const ToastProvider = ({ children, defaultDuration = 3500 }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message, opts = {}) => {
      const id = idSeq++;
      const toast = {
        id,
        message,
        type: opts.type || "info", // success | error | warning | info
        duration: opts.duration ?? defaultDuration,
      };
      setToasts((prev) => [...prev, toast]);
      if (toast.duration > 0) {
        setTimeout(() => remove(id), toast.duration);
      }
      return id;
    },
    [defaultDuration, remove],
  );

  const value = useMemo(
    () => ({ show, remove, toasts }),
    [show, remove, toasts],
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

export const ToastContainer = () => {
  const { toasts, remove } = useToast();
  return (
    <div className="fixed right-4 top-20 sm:top-24 z-40 space-y-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={
            `min-w-[260px] max-w-sm px-4 py-3 rounded-lg shadow-lg border text-sm transition-all ` +
            (t.type === "success"
              ? "bg-success/15 border-success/30 text-success"
              : t.type === "error"
                ? "bg-error/15 border-error/30 text-error"
                : t.type === "warning"
                  ? "bg-warning/15 border-warning/30 text-warning"
                  : "bg-surface border-border-accent/30 text-text-primary")
          }
          style={{ pointerEvents: "auto" }}
        >
          <div className="flex items-start gap-3">
            <span className="flex-1">{t.message}</span>
            <button
              className="text-text-secondary hover:text-text-primary"
              onClick={() => remove(t.id)}
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastContext;
