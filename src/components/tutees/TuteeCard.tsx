import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import type { Tutee } from '@/lib/types/database.types';

interface TuteeCardProps {
  tutee: Tutee;
  index?: number;
}

export function TuteeCard({ tutee, index = 0 }: TuteeCardProps) {
  return (
    <Link
      href={`/tutees/${tutee.id}`}
      className="block bg-surface rounded-2xl shadow-card p-4 active:scale-98 transition-transform"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="font-serif text-primary text-base font-medium">
                {tutee.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-text text-base leading-snug truncate">{tutee.full_name}</h3>
              {tutee.year_group && (
                <p className="text-xs text-text-muted leading-none">{tutee.year_group}</p>
              )}
            </div>
          </div>
          {tutee.subjects && tutee.subjects.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {tutee.subjects.map((subject) => (
                <Badge key={subject} variant="primary">{subject}</Badge>
              ))}
            </div>
          )}
        </div>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-2 text-text-muted">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  );
}
