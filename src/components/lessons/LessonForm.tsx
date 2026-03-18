'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
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

export function LessonForm({ lesson, mode, defaultTuteeId, defaultDate }: LessonFormProps) {
  const router = useRouter();
  const { createLesson, updateLesson } = useLessons();
  const { tutees, loading: tuteesLoading } = useTutees();
  const [serverError, setServerError] = useState('');

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
  const selectedTutee = tutees.find((t) => t.id === selectedTuteeId);

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
      };

      if (mode === 'create') {
        const created = await createLesson(payload);
        router.push(`/lessons/${created.id}`);
      } else if (lesson) {
        await updateLesson(lesson.id, payload);
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
          {mode === 'create' ? 'Schedule lesson' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
