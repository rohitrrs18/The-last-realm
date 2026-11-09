export function MobilePanel({ open, children }: any) { if (!open) return null; return <div className="fixed inset-0 z-50 bg-black/80 flex">{children}</div>; }
export function MobileDrawerTrigger({ icon, label, onClick }: any) { return <button onClick={onClick} className="flex items-center gap-1 text-xs text-muted">{icon}{label}</button>; }
