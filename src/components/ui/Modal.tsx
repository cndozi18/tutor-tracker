'use client';

import { useEffect, useRef } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  variant?: 'sheet' | 'dialog';
}

export function Modal({ open, onClose, title, children, variant = 'sheet' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  if (variant === 'sheet') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-end" role="dialog" aria-modal="true">
        <div
          ref={overlayRef}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />
        <div className="relative bg-surface rounded-t-2xl shadow-card-lg max-h-[90dvh] flex flex-col animate-sheet-up"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>
          {title && (
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h2 className="font-serif text-xl text-text">{title}</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-background transition-colors" aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5l10 10" stroke="#7C847E" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}
          <div className="overflow-y-auto flex-1 px-5 py-4">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-card-lg w-full max-w-md max-h-[80dvh] flex flex-col animate-slide-up">
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-serif text-xl text-text">{title}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-background transition-colors" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5l10 10" stroke="#7C847E" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
