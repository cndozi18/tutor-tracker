'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLessons } from '@/hooks/useLessons';
import { useTutees } from '@/hooks/useTutees';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import type { Lesson } from '@/lib/types/database.types';

const lessonSchema = z.object({
  tutee_id: z.string().min(1, 'Please select a tutee'),
  starts_at_date: z.string().min(1, 'Date is required'),
  starts_at_time: z.string().min(1, 'Time is required'),
  duration_mins: z.number().min(15).max(480),
  subject: z.string().optional(),
  plan: z.string().optional(),
  notes: z.string().optional(),
  homework_set: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']),
});

type LessonFormValues = z.infer<typeof lessonSchema>;

const DURATIONS = [
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
];

const STATUSES = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No show' },
];

interface LessonFormProps {
  lesson?: Lesson;
  mode: 'create' | 'edit';
  defaultTuteeId?: string;
  defaultDate?: string;
}

function toLocalDateTimeString(iso: string) {
  const d = new Date(iso);
  const date = d.toISOString().slice(0, 10);
  const time = d.toTimeString().slice(0, 5);
  return { date, time };
}

function getMaxEndDate(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

function buildPreviewDates(startDate: string, startTime: string, rule: 'weekly' | 'biweekly'): string[] {
  if (!startDate || !startTime) return [];
  const intervalDays = rule === 'weekly' ? 7 : 14;
  const dates: string[] = [];
  let current = new Date(`${startDate}T${startTime}:00`);
  for (let i = 0; i < 5; i++) {
    dates.push(
      current.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    );
    current = new Date(current.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  }
  return dates;
}

export function LessonForm({ lesson, mode, defaultTuteeId, defaultDate }: LessonFormProps) {
  const router = useRouter();
  const { createLesson, createRecurringSeries, updateLesson, updateFutureLessons } = useLessons();
  const { tutees, loading: tuteesLoading } = useTutees();
  const [serverError, setServerError] = useState('');

  // Recurrence state (create mode only)
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<'weekly' | 'biweekly'>('weekly');
  const [endsType, setEndsType] = useState<'months3' | 'sessions' | 'date'>('months3');
  const [endOccurrences, setEndOccurrences] = useState('');
  const [endDate, setEndDate] = useState('');

  // Edit mode: apply changes to future lessons in series
  const [applyToFuture, setApplyToFuture] = useState(false);

  const defaultValues = lesson
    ? (() => {
        const { date, time } = toLocalDateTimeString(lesson.starts_at);
        return {
          tutee_id: lesson.tutee_id,
          starts_at_date: date,
          starts_at_time: time,
          duration_mins: lesson.duration_mins,
          subject: lesson.subject ?? '',
          plan: lesson.plan ?? '',
          notes: lesson.notes ?? '',
          homework_set: lesson.homework_set ?? '',
          status: lesson.status,
        };
      })()
    : {
        tutee_id: defaultTuteeId ?? '',
        starts_at_date: defaultDate ?? new Date().toISOString().slice(0, 10),
        starts_at_time: '09:00',
        duration_mins: 60,
        subject: '',
        plan: '',
        notes: '',
        homework_set: '',
        status: 'scheduled' as const,
      };

  const { register, control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues,
  });

  const selectedTuteeId = watch('tutee_id');
  const watchedDate = watch('starts_at_date');
  const watchedTime = watch('starts_at_time');
  const selectedTutee = tutees.find((t) => t.id === selectedTuteeId);

  const previewDates = useMemo(
    () => (isRecurring ? buildPreviewDates(watchedDate, watchedTime, recurrenceRule) : []),
    [isRecurring, watchedDate, watchedTime, recurrenceRule]
  );

  const onSubmit = async (values: LessonFormValues) => {
    setServerError('');
    try {
      const starts_at = new Date(`${values.starts_at_date}T${values.starts_at_time}:00`).toISOString();
      const payload = {
        tutee_id: values.tutee_id,
        starts_at,
        duration_mins: values.duration_mins,
        subject: values.subject || null,
        plan: values.plan || null,
        notes: values.notes || null,
        homework_set: values.homework_set || null,
        status: values.status,
        series_id: null as string | null,
        recurrence_rule: null as 'weekly' | 'biweekly' | null,
      };

      if (mode === 'create') {
        if (isRecurring) {
          const recurrenceOptions: { rule: 'weekly' | 'biweekly'; endDate?: string; occurrences?: number } = {
            rule: recurrenceRule,
          };
          if (endsType === 'sessions' && endOccurrences) {
            recurrenceOptions.occurrences = parseInt(endOccurrences, 10);
          } else if (endsType === 'date' && endDate) {
            recurrenceOptions.endDate = endDate;
          }
          await createRecurringSeries(payload, recurrenceOptions);
          router.push('/lessons');
        } else {
          const created = await createLesson(payload);
          router.push(`/lessons/${created.id}`);
        }
      } else if (lesson) {
        await updateLesson(lesson.id, payload);
        if (applyToFuture && lesson.series_id) {
          await updateFutureLessons(
            lesson.series_id,
            lesson.starts_at,
            values.starts_at_time,
            values.duration_mins,
            values.subject || null
          );
        }
        router.push(`/lessons/${lesson.id}`);
      }
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const tuteeOptions = tutees.map((t) => ({ value: t.id, label: t.full_name }));
  const subjectOptions = selectedTutee?.subjects?.map((s) => ({ value: s, label: s })) ?? [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 pb-6">
      <div>
        <h2 className="font-serif text-xl text-text-muted mb-0.5">Lesson details</h2>
        <div className="h-px bg-border mb-4" />
        <div className="flex flex-col gap-4">
          <Controller
            name="tutee_id"
            control={control}
            render={({ field }) => (
              <Select
                label="Tutee"
                options={tuteeOptions}
                placeholder={tuteesLoading ? 'Loading...' : 'Select tutee...'}
                error={errors.tutee_id?.message}
                {...field}
              />
            )}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date"
              type="date"
              {...register('starts_at_date')}
              error={errors.starts_at_date?.message}
            />
            <Input
              label="Time"
              type="time"
              {...register('starts_at_time')}
              error={errors.starts_at_time?.message}
            />
          </div>

          <Controller
            name="duration_mins"
            control={control}
            render={({ field }) => (
              <Select
                label="Duration"
                options={DURATIONS}
                {...field}
                value={String(field.value)}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />

          {subjectOptions.length > 0 && (
            <Controller
              name="subject"
              control={control}
              render={({ field }) => (
                <Select
                  label="Subject"
                  options={subjectOptions}
                  placeholder="Select subject..."
                  {...field}
                  value={field.value ?? ''}
                />
              )}
            />
          )}

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select label="Status" options={STATUSES} {...field} />
            )}
          />
        </div>
      </div>

      {/* Recurrence section — create mode only */}
      {mode === 'create' && (
        <div>
          <h2 className="font-serif text-xl text-text-muted mb-0.5">Repeat</h2>
          <div className="h-px bg-border mb-4" />

          <label className="flex items-center gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 rounded accent-primary"
            />
            <span className="text-sm text-text font-medium">Repeat this lesson</span>
          </label>

          {isRecurring && (
            <div className="flex flex-col gap-4 pl-1">
              {/* Frequency */}
              <div>
                <p className="text-sm font-medium text-text mb-2">Frequency</p>
                <div className="flex gap-3">
                  {(['weekly', 'biweekly'] as const).map((rule) => (
                    <label key={rule} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="recurrenceRule"
                        value={rule}
                        checked={recurrenceRule === rule}
                        onChange={() => setRecurrenceRule(rule)}
                        className="accent-primary"
                      />
                      <span className="text-sm text-text">
                        {rule === 'weekly' ? 'Weekly' : 'Every 2 weeks'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* End condition */}
              <div>
                <p className="text-sm font-medium text-text mb-2">Ends</p>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="endsType"
                      checked={endsType === 'months3'}
                      onChange={() => setEndsType('months3')}
                      className="accent-primary"
                    />
                    <span className="text-sm text-text">After 3 months</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="endsType"
                      checked={endsType === 'sessions'}
                      onChange={() => setEndsType('sessions')}
                      className="accent-primary"
                    />
                    <span className="text-sm text-text">After</span>
                    <input
                      type="number"
                      min={1}
                      max={52}
                      value={endOccurrences}
                      onChange={(e) => { setEndsType('sessions'); setEndOccurrences(e.target.value); }}
                      placeholder="e.g. 10"
                      className="w-20 h-8 px-2 text-sm rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm text-text">sessions</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="endsType"
                      checked={endsType === 'date'}
                      onChange={() => setEndsType('date')}
                      className="accent-primary"
                    />
                    <span className="text-sm text-text">On</span>
                    <input
                      type="date"
                      value={endDate}
                      max={getMaxEndDate()}
                      onChange={(e) => { setEndsType('date'); setEndDate(e.target.value); }}
                      className="h-8 px-2 text-sm rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </label>
                </div>
              </div>

              {/* Preview dates */}
              {previewDates.length > 0 && (
                <div className="bg-background rounded-xl p-3">
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
                    First {previewDates.length} sessions
                  </p>
                  <ul className="flex flex-col gap-1">
                    {previewDates.map((d, i) => (
                      <li key={i} className="text-sm text-text flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Apply to future — edit mode, recurring lessons only */}
      {mode === 'edit' && lesson?.series_id && (
        <div>
          <h2 className="font-serif text-xl text-text-muted mb-0.5">Recurring series</h2>
          <div className="h-px bg-border mb-4" />
          <div className="bg-background rounded-xl p-3 mb-3">
            <p className="text-xs text-text-muted">
              This lesson repeats{' '}
              {lesson.recurrence_rule === 'weekly' ? 'weekly' : 'every 2 weeks'}.
            </p>
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={applyToFuture}
              onChange={(e) => setApplyToFuture(e.target.checked)}
              className="w-4 h-4 rounded accent-primary mt-0.5"
            />
            <span className="text-sm text-text">
              Apply time and duration changes to all future lessons in this series
            </span>
          </label>
        </div>
      )}

      <div>
        <h2 className="font-serif text-xl text-text-muted mb-0.5">Session notes</h2>
        <div className="h-px bg-border mb-4" />
        <div className="flex flex-col gap-4">
          <Textarea label="Plan" placeholder="What do you plan to cover?" {...register('plan')} rows={3} />
          <Textarea label="Notes" placeholder="Post-session observations..." {...register('notes')} rows={3} />
          <Textarea label="Homework set" placeholder="What homework was given?" {...register('homework_set')} rows={2} />
        </div>
      </div>

      {serverError && <p className="text-sm text-rag-red text-center">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting} className="flex-1">
          {mode === 'create'
            ? isRecurring
              ? 'Schedule series'
              : 'Schedule lesson'
            : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
