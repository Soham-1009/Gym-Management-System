import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-xl' }) => {
  // Keep the latest onClose in a ref so inline arrow props don't re-run the effect every render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCloseRef.current?.();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-root" role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/40 dark:bg-black/70 backdrop-blur-sm animate-fade-in no-print"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${maxWidth} bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/[0.08] rounded-2xl shadow-2xl shadow-zinc-950/10 dark:shadow-black/50 overflow-hidden z-10 animate-scale-in max-h-[90vh] flex flex-col text-zinc-900 dark:text-zinc-100`}
      >
        {/* Gradient accent line */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 no-print" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-white/[0.06] no-print">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white tracking-tight">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06] hover:rotate-90 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
