'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTutees } from '@/hooks/useTutees';
import type { Tutee } from '@/lib/types/database.types';

interface TuteeSearchProps {
  onResults: (tutees: Tutee[]) => void;
  initialTutees: Tutee[];
}

export function TuteeSearch({ onResults, initialTutees }: TuteeSearchProps) {
  const [query, setQuery] = useState('');
  const { searchTutees } = useTutees();

  const debounceSearch = useCallback(
    (() => {
      let timer: ReturnType<typeof setTimeout>;
      return (q: string) => {
        clearTimeout(timer);
        timer = setTimeout(async () => {
          if (!q.trim()) {
            onResults(initialTutees);
          } else {
            const results = await searchTutees(q);
            onResults(results);
          }
        }, 300);
      };
    })(),
    [searchTutees, initialTutees, onResults]
  );

  useEffect(() => {
    debounceSearch(query);
  }, [query, debounceSearch]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="8" cy="8" r="5.25" />
          <path d="M14.25 14.25L11.5 11.5" />
        </svg>
      </div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search tutees..."
        className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-surface font-sans text-base text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
      />
    </div>
  );
}
