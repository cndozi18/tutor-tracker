'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTutees } from '@/hooks/useTutees';
import { TuteeCard } from '@/components/tutees/TuteeCard';
import { TuteeSearch } from '@/components/tutees/TuteeSearch';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import type { Tutee } from '@/lib/types/database.types';

export default function TuteesPage() {
  const { tutees, loading } = useTutees();
  const [displayedTutees, setDisplayedTutees] = useState<Tutee[]>([]);

  const effectiveTutees = displayedTutees.length > 0 || loading ? displayedTutees : tutees;

  return (
    <div className="px-5 pt-8 pb-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl text-text">Tutees</h1>
        <Link href="/tutees/new">
          <Button size="sm">+ New</Button>
        </Link>
      </div>

      <div className="mb-5">
        <TuteeSearch onResults={setDisplayedTutees} initialTutees={tutees} />
      </div>

      {loading ? (
        <LoadingSpinner className="py-12" />
      ) : effectiveTutees.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A6B5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <p className="font-serif text-xl text-text mb-1">No tutees yet</p>
          <p className="text-text-muted text-sm mb-6">Add your first tutee to get started.</p>
          <Link href="/tutees/new">
            <Button>Add first tutee</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {effectiveTutees.map((tutee, i) => (
            <div key={tutee.id} className="animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
              <TuteeCard tutee={tutee} index={i} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
