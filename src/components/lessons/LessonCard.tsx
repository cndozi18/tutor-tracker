import Link from 'next/link';
import type { Lesson } from '@/lib/types/database.types';

interface LessonCardProps {
  lesson: Lesson & { tutees?: { full_name: string; subjects: string[] | null } };
  showTuteeName?: boolean;
}

const STATUS_CONFIG = {
  scheduled: { label: 'Scheduled', color: 'text-primary bg-primary/10' },
  completed: { label: 'Completed', color: 'text-rag-green bg-rag-green-bg' },
  cancelled: { label: 'Cancelled', color: 'text-text-muted bg-background' },
  no_show: { label: 'No show', color: 'text-rag-red bg-rag-red-bg' },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function LessonCard({ lesson, showTuteeName = false }: LessonCardProps) {
  const status = STATUS_CONFIG[lesson.status] ?? STATUS_CONFIG.scheduled;

  return (
    <Link
      href={`/lessons/${lesson.id}`}
      className="block card-base border-l-3 border-l-accent p-4 hover:shadow-card-hover active:scale-[0.98] transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 text-center">
          <p className="text-xs font-semibold uppercase text-text-muted leading-none">{formatDate(lesson.starts_at).split(' ')[0]}</p>
          <p className="text-lg font-semibold text-text leading-tight">{formatDate(lesson.starts_at).split(' ')[1]}</p>
          <p className="text-[10px] text-text-muted leading-none">{formatDate(lesson.starts_at).split(' ')[2]}</p>
        </div>
        <div className="w-px h-10 bg-border" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm font-semibold text-text">{formatTime(lesson.starts_at)}</span>
            <span className="text-xs text-text-muted">· {lesson.duration_mins}min</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {showTuteeName && lesson.tutees && (
              <span className="text-xs font-semibold text-primary">{lesson.tutees.full_name}</span>
            )}
            {lesson.subject && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent/10 text-accent-dark font-medium">{lesson.subject}</span>
            )}
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${status.color}`}>{status.label}</span>
          </div>
          {lesson.notes && (
            <p className="text-xs text-text-muted mt-1 line-clamp-1">{lesson.notes}</p>
          )}
        </div>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 text-text-muted">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  );
}
