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
      className="block card-base border-l-3 border-l-primary p-4 hover:shadow-card-hover active:scale-[0.98] transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B8F6D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-text">{dayName}</span>
            <span className="text-sm text-text-muted">{time}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {ruleLabel}
            </span>
            {firstLesson.subject && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent/10 text-accent-dark font-medium">
                {firstLesson.subject}
              </span>
            )}
            <span className="text-[11px] text-text-muted">
              {count} session{count !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 text-text-muted">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  );
}
