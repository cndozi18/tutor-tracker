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
      className="block card-base border-l-3 border-l-primary p-4 hover:shadow-card-hover active:scale-[0.98] transition-all"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="font-serif text-primary text-lg font-medium">
            {tutee.full_name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text text-[15px] leading-snug truncate">{tutee.full_name}</h3>
          {tutee.year_group && (
            <p className="text-xs text-text-muted mt-0.5">{tutee.year_group}</p>
          )}
          {tutee.subjects && tutee.subjects.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tutee.subjects.map((subject) => (
                <Badge key={subject} variant="primary">{subject}</Badge>
              ))}
            </div>
          )}
        </div>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 text-text-muted">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  );
}
