import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LessonCard } from '@/components/lessons/LessonCard';
import type { Lesson } from '@/lib/types/database.types';

type LessonWithTutee = Lesson & {
  tutees?: { full_name: string; subjects: string[] | null };
};

interface Props {
  params: { seriesId: string };
}

export default async function SeriesDetailPage({ params }: Props) {
  const supabase = await createClient();

  const { data: lessonsData } = await supabase
    .from('lessons')
    .select('*, tutees(full_name, subjects)')
    .eq('series_id', params.seriesId)
    .order('starts_at');

  if (!lessonsData || lessonsData.length === 0) notFound();

  const lessons = lessonsData as unknown as LessonWithTutee[];
  const firstLesson = lessons[0];

  const d = new Date(firstLesson.starts_at);
  const dayName = d.toLocaleDateString('en-GB', { weekday: 'long' });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const ruleLabel = firstLesson.recurrence_rule === 'weekly' ? 'Weekly' : 'Every 2 weeks';

  const now = new Date().toISOString();
  const upcoming = lessons.filter((l) => l.starts_at >= now);
  const past = [...lessons.filter((l) => l.starts_at < now)].reverse();

  return (
    <div className="px-5 pt-8 pb-6 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-text leading-tight">{dayName}s at {time}</h1>
        <p className="text-sm text-text-muted mt-0.5">
          {ruleLabel}
          {firstLesson.tutees && ` · ${firstLesson.tutees.full_name}`}
          {firstLesson.subject && ` · ${firstLesson.subject}`}
        </p>
      </div>

      {upcoming.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="font-serif text-lg text-text">Upcoming</h2>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="flex flex-col gap-3">
            {upcoming.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="font-serif text-lg text-text">Past</h2>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="flex flex-col gap-3">
            {past.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
