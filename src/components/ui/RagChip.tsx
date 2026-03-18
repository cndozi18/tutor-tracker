'use client';

import { useState } from 'react';

type RagStatus = 'red' | 'amber' | 'green';

interface RagChipProps {
  topic: string;
  status: RagStatus;
  onStatusChange?: (status: RagStatus) => void;
  onRemove?: () => void;
  readonly?: boolean;
}

const RAG_CONFIG = {
  red: {
    label: 'Struggling',
    bg: 'bg-rag-red-bg',
    text: 'text-rag-red',
    border: 'border-rag-red/30',
    dot: 'bg-rag-red',
    next: 'amber' as RagStatus,
  },
  amber: {
    label: 'Monitor',
    bg: 'bg-rag-amber-bg',
    text: 'text-rag-amber',
    border: 'border-rag-amber/30',
    dot: 'bg-rag-amber',
    next: 'green' as RagStatus,
  },
  green: {
    label: 'Confident',
    bg: 'bg-rag-green-bg',
    text: 'text-rag-green',
    border: 'border-rag-green/30',
    dot: 'bg-rag-green',
    next: 'red' as RagStatus,
  },
};

export function RagChip({ topic, status, onStatusChange, onRemove, readonly }: RagChipProps) {
  const [isPulsing, setIsPulsing] = useState(false);
  const config = RAG_CONFIG[status];

  const handleTap = () => {
    if (readonly || !onStatusChange) return;
    setIsPulsing(true);
    onStatusChange(config.next);
    setTimeout(() => setIsPulsing(false), 200);
  };

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-rag-chip
        ${config.bg} ${config.text} ${config.border}
        ${!readonly ? 'cursor-pointer select-none active:scale-95' : ''}
        ${isPulsing ? 'rag-pulse' : ''}
        transition-transform
      `}
      onClick={handleTap}
      role={!readonly ? 'button' : undefined}
      aria-label={!readonly ? `${topic}: ${config.label}. Tap to change.` : `${topic}: ${config.label}`}
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dot}`} />
      <span className="text-sm font-medium leading-none">{topic}</span>
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-0.5 hover:opacity-70 transition-opacity"
          aria-label={`Remove ${topic}`}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
