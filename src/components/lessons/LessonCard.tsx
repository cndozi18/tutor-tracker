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
      className="block bg-surface rounded-2xl shadow-card p-4 active:scale-98 transition-transform"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-text">{formatDate(lesson.starts_at)}</span>
            <span className="text-sm text-text-muted">{formatTime(lesson.starts_at)}</span>
            <span className="text-xs text-text-muted">· {lesson.duration_mins}min</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {showTuteeName && lesson.tutees && (
              <span className="text-sm font-medium text-primary">{lesson.tutees.full_name}</span>
            )}
            {lesson.subject && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent-dark font-medium">{lesson.subject}</span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>{status.label}</span>
          </div>
          {lesson.notes && (
            <p className="text-xs text-text-muted mt-1.5 line-clamp-2">{lesson.notes}</p>
          )}
        </div>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-1 text-text-muted">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  );
}
