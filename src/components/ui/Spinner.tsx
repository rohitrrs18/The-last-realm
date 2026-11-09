export function Spinner() { return <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold" />; }
export function LoadingScreen({ message }: any) { return <div className="h-full flex items-center justify-center bg-bg text-ink h-serif">{message}</div>; }
export function LoadingOverlay() { return null; }
