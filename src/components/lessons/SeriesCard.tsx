import Link from 'next/link';
import type { Lesson } from '@/lib/types/database.types';

interface SeriesCardProps {
  seriesId: string;
  lessons: Lesson[];
  recurrenceRule: 'weekly' | 'biweekly';
}

export function SeriesCard({ seriesId, lessons, recurrenceRule }: SeriesCardProps) {
  const firstLesson = lessons[0];
  const d = new Date(firstLesson.starts_at);
  const dayName = d.toLocaleDateString('en-GB', { weekday: 'long' });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const ruleLabel = recurrenceRule === 'weekly' ? 'Weekly' : 'Every 2 weeks';
  const count = lessons.length;

  return (
    <Link
      href={`/lessons/series/${seriesId}`}
      className="block bg-surface rounded-2xl shadow-card p-4 active:scale-98 transition-transform"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-medium text-text">{dayName}</span>
            <span className="text-sm text-text-muted">{time}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {ruleLabel}
            </span>
            {firstLesson.subject && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent-dark font-medium">
                {firstLesson.subject}
              </span>
            )}
            <span className="text-xs text-text-muted">
              {count} session{count !== 1 ? 's' : ''} upcoming
            </span>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-1 text-text-muted">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  );
}
