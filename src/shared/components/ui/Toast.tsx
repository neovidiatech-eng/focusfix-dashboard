import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const STYLES: Record<ToastKind, { box: string; icon: typeof Info }> = {
  success: { box: 'bg-emerald-600 text-white', icon: CheckCircle2 },
  error: { box: 'bg-rose-600 text-white', icon: AlertTriangle },
  info: { box: 'bg-slate-900 text-white', icon: Info },
};

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (kind: ToastKind, message: string) => {
      const id = nextId++;
      setToasts((prev) => [...prev.slice(-3), { id, kind, message }]);
      setTimeout(() => dismiss(id), kind === 'error' ? 6000 : 3500);
    },
    [dismiss]
  );

  const api: ToastApi = {
    success: useCallback((m: string) => push('success', m), [push]),
    error: useCallback((m: string) => push('error', m), [push]),
    info: useCallback((m: string) => push('info', m), [push]),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-4 left-4 z-[100] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)]" aria-live="polite">
        {toasts.map((t) => {
          const { box, icon: Icon } = STYLES[t.kind];
          return (
            <div key={t.id} className={`${box} rounded-xl shadow-lg px-4 py-3 flex items-start gap-3 text-sm font-medium animate-[fadeIn_.15s_ease-out]`}>
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="flex-1 leading-relaxed">{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="opacity-70 hover:opacity-100" aria-label="إغلاق">
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
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
