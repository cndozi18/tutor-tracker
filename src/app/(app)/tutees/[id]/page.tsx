import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TopicProgressPanel } from '@/components/tutees/TopicProgressPanel';
import { TuteeActions } from '@/components/tutees/TuteeActions';
import { LessonCard } from '@/components/lessons/LessonCard';
import { SeriesCard } from '@/components/lessons/SeriesCard';
import type { Tutee, Lesson } from '@/lib/types/database.types';

interface Props {
  params: { id: string };
}

export default async function TuteeProfilePage({ params }: Props) {
  const supabase = await createClient();

  const { data: tuteeData } = await supabase
    .from('tutees')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!tuteeData) notFound();
  const tutee = tuteeData as unknown as Tutee;

  const now = new Date().toISOString();

  // Past lessons — most recent 5
  const { data: pastData } = await supabase
    .from('lessons')
    .select('*')
    .eq('tutee_id', params.id)
    .lt('starts_at', now)
    .order('starts_at', { ascending: false })
    .limit(5);
  const pastLessons = (pastData ?? []) as unknown as Lesson[];

  // Upcoming lessons — all
  const { data: upcomingData } = await supabase
    .from('lessons')
    .select('*')
    .eq('tutee_id', params.id)
    .gte('starts_at', now)
    .order('starts_at');
  const upcomingLessons = (upcomingData ?? []) as unknown as Lesson[];

  // Group upcoming by series_id
  const seriesGroups: Record<string, Lesson[]> = {};
  const individualLessons: Lesson[] = [];
  for (const lesson of upcomingLessons) {
    if (lesson.series_id) {
      if (!seriesGroups[lesson.series_id]) seriesGroups[lesson.series_id] = [];
      seriesGroups[lesson.series_id].push(lesson);
    } else {
      individualLessons.push(lesson);
    }
  }

  const hasScheduled = upcomingLessons.length > 0;

  return (
    <div className="px-5 pt-8 pb-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="font-serif text-primary text-xl">{tutee.full_name.charAt(0)}</span>
          </div>
          <div>
            <h1 className="font-serif text-2xl text-text leading-tight">{tutee.full_name}</h1>
            {tutee.year_group && <p className="text-sm text-text-muted">{tutee.year_group}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/tutees/${tutee.id}/edit`}>
            <Button variant="secondary" size="sm">Edit</Button>
          </Link>
          <TuteeActions tuteeId={tutee.id} tuteeName={tutee.full_name} />
        </div>
      </div>

      {/* Subjects */}
      {tutee.subjects && tutee.subjects.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {tutee.subjects.map((s) => <Badge key={s} variant="primary">{s}</Badge>)}
        </div>
      )}

      {/* Quick info */}
      {(tutee.parent_name || tutee.parent_phone || tutee.parent_email) && (
        <div className="card-base p-4 mb-6">
          <p className="section-label mb-3">Parent / guardian</p>
          <div className="space-y-2">
            {tutee.parent_name && (
              <div className="flex items-center gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C847E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                <span className="text-sm text-text font-medium">{tutee.parent_name}</span>
              </div>
            )}
            {tutee.parent_phone && (
              <div className="flex items-center gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C847E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                <a href={`tel:${tutee.parent_phone}`} className="text-sm text-primary">{tutee.parent_phone}</a>
              </div>
            )}
            {tutee.parent_email && (
              <div className="flex items-center gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C847E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                <a href={`mailto:${tutee.parent_email}`} className="text-sm text-primary">{tutee.parent_email}</a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {tutee.notes && (
        <div className="card-base p-4 mb-6">
          <p className="section-label mb-2">Notes</p>
          <p className="text-sm text-text whitespace-pre-wrap">{tutee.notes}</p>
        </div>
      )}

      {/* Topic progress */}
      <div className="mb-6">
        <p className="section-label mb-3">Topic Progress</p>
        <TopicProgressPanel tutee={tutee} />
      </div>

      {/* Scheduled lessons */}
      <div className="mb-6">
        <p className="section-label mb-3">Scheduled Lessons</p>
        {hasScheduled ? (
          <div className="flex flex-col gap-3">
            {Object.entries(seriesGroups).map(([seriesId, lessons]) => (
              <SeriesCard
                key={seriesId}
                seriesId={seriesId}
                lessons={lessons}
                recurrenceRule={lessons[0].recurrence_rule ?? 'weekly'}
              />
            ))}
            {individualLessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted italic">No upcoming lessons</p>
        )}
      </div>

      {/* Past lessons */}
      <div className="mb-6">
        <p className="section-label mb-3">Recent Lessons</p>
        {pastLessons.length > 0 ? (
          <div className="flex flex-col gap-3">
            {pastLessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted italic">No past lessons yet</p>
        )}
      </div>

      {/* Quick add lesson */}
      <Link href={`/lessons/new?tuteeId=${tutee.id}`}>
        <Button variant="secondary" className="w-full">+ Schedule a lesson</Button>
      </Link>
    </div>
  );
}
