import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
export function Modal({ open, onClose, title, children, footer, maxWidthClass = 'max-w-lg' }: any) {
  if (typeof document === 'undefined') return null;
  return createPortal(<AnimatePresence>{open && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" onClick={onClose}><motion.div onClick={(e) => e.stopPropagation()} className={`bg-panel border border-gold/20 rounded-sm w-full ${maxWidthClass}`}><div className="p-4 border-b border-gold/10 flex justify-between"><h2 className="text-xl h-serif text-ink">{title}</h2><button onClick={onClose}><X size={18}/></button></div><div className="p-4">{children}</div>{footer && <div className="p-4 border-t border-gold/10 flex justify-end">{footer}</div>}</motion.div></motion.div>}</AnimatePresence>, document.body);
}
