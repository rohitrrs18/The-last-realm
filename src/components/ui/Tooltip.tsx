import { useState } from 'react';
export function Tooltip({ children, content, side = 'top' }: any) {
  const [show, setShow] = useState(false);
  return <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>{children}{show && <div className="absolute z-50 bg-elevated border border-gold/20 p-2 rounded-sm text-xs text-ink2 whitespace-nowrap -top-8 left-1/2 -translate-x-1/2">{content}</div>}</div>;
}
