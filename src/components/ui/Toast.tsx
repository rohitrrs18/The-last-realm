import { create } from 'zustand';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle, Info, Trophy } from 'lucide-react';

export interface ToastItem {
  id: string;
  kind: 'success' | 'error' | 'info' | 'achievement';
  title: string;
  body?: string;
}

interface ToastStore {
  toasts: ToastItem[];
  push: (t: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    set({ toasts: [...get().toasts, { ...t, id }] });
    setTimeout(() => get().dismiss(id), 4000);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

export const toast = {
  success: (m: string, o?: { title?: string; body?: string }) =>
    useToastStore.getState().push({ kind: 'success', title: o?.title || m, body: o?.body }),
  error: (m: string, o?: { title?: string; body?: string }) =>
    useToastStore.getState().push({ kind: 'error', title: o?.title || m, body: o?.body }),
  info: (m: string, o?: { title?: string; body?: string }) =>
    useToastStore.getState().push({ kind: 'info', title: o?.title || m, body: o?.body }),
  achievement: (m: string, o?: { title?: string; body?: string }) =>
    useToastStore.getState().push({ kind: 'achievement', title: o?.title || m, body: o?.body }),
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className="bg-panel border border-gold/20 rounded-sm p-3 shadow-panel w-80 pointer-events-auto"
          >
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-ink">{t.title}</span>
              <button onClick={() => useToastStore.getState().dismiss(t.id)} className="text-muted hover:text-ink">
                <X size={14} />
              </button>
            </div>
            {t.body && <div className="text-xs text-ink2 mt-1">{t.body}</div>}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
