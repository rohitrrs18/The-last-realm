import React from 'react';
export function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-panel border border-gold/10 rounded-sm shadow-panel relative ${className}`}><div className="absolute inset-0 pointer-events-none bg-noise opacity-40" /><div className="relative">{children}</div></div>;
}
