import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/Button';
import type { Lesson } from '@/lib/types/database.types';

type LessonWithTutee = Lesson & {
  tutees: { full_name: string; year_group: string | null } | null;
};

interface Props {
  params: { id: string };
}

const STATUS_CONFIG = {
  scheduled: { label: 'Scheduled', color: 'text-primary bg-primary/10' },
  completed: { label: 'Completed', color: 'text-rag-green bg-rag-green-bg' },
  cancelled: { label: 'Cancelled', color: 'text-text-muted bg-background' },
  no_show: { label: 'No show', color: 'text-rag-red bg-rag-red-bg' },
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  };
}

export default async function LessonDetailPage({ params }: Props) {
  const supabase = await createClient();

  const { data: lessonData } = await supabase
    .from('lessons')
    .select('*, tutees(full_name, year_group)')
    .eq('id', params.id)
    .single();

  if (!lessonData) notFound();

  const lesson = lessonData as unknown as LessonWithTutee;
  const { date, time } = formatDateTime(lesson.starts_at);
  const status = STATUS_CONFIG[lesson.status] ?? STATUS_CONFIG.scheduled;
  const tutee = lesson.tutees;

  return (
    <div className="px-5 pt-8 pb-6 max-w-lg mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-text leading-tight">{date}</h1>
          <p className="text-text-muted text-sm mt-0.5">{time} · {lesson.duration_mins} min</p>
        </div>
        <Link href={`/lessons/${lesson.id}/edit`}>
          <Button variant="secondary" size="sm">Edit</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${status.color}`}>{status.label}</span>
        {lesson.subject && (
          <span className="text-sm px-3 py-1 rounded-full bg-accent/10 text-accent-dark font-medium">{lesson.subject}</span>
        )}
      </div>

      {tutee && (
        <Link href={`/tutees/${lesson.tutee_id}`} className="block bg-surface rounded-2xl shadow-card p-4 mb-5">
          <p className="text-xs text-text-muted uppercase tracking-wide font-medium mb-1">Tutee</p>
          <p className="font-medium text-text">{tutee.full_name}</p>
          {tutee.year_group && <p className="text-sm text-text-muted">{tutee.year_group}</p>}
        </Link>
      )}

      {lesson.plan && (
        <div className="bg-surface rounded-2xl shadow-card p-4 mb-4">
          <p className="text-xs text-text-muted uppercase tracking-wide font-medium mb-2">Plan</p>
          <p className="text-sm text-text whitespace-pre-wrap">{lesson.plan}</p>
        </div>
      )}

      {lesson.notes && (
        <div className="bg-surface rounded-2xl shadow-card p-4 mb-4">
          <p className="text-xs text-text-muted uppercase tracking-wide font-medium mb-2">Notes</p>
          <p className="text-sm text-text whitespace-pre-wrap">{lesson.notes}</p>
        </div>
      )}

      {lesson.homework_set && (
        <div className="bg-surface rounded-2xl shadow-card p-4 mb-4">
          <p className="text-xs text-text-muted uppercase tracking-wide font-medium mb-2">Homework set</p>
          <p className="text-sm text-text whitespace-pre-wrap">{lesson.homework_set}</p>
        </div>
      )}
    </div>
  );
}
