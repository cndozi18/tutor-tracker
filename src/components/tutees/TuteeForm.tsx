'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTutees } from '@/hooks/useTutees';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import type { Tutee } from '@/lib/types/database.types';

const tuteeSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  year_group: z.string().optional(),
  age: z.number().min(4).max(100).optional().nullable(),
  subjects: z.array(z.string()),
  learning_style: z.string().optional(),
  parent_name: z.string().optional(),
  parent_email: z.string().email().optional().or(z.literal('')),
  parent_phone: z.string().optional(),
  notes: z.string().optional(),
});

type TuteeFormValues = z.infer<typeof tuteeSchema>;

const YEAR_GROUPS = [
  { value: 'Year 7', label: 'Year 7' },
  { value: 'Year 8', label: 'Year 8' },
  { value: 'Year 9', label: 'Year 9' },
  { value: 'Year 10', label: 'Year 10' },
  { value: 'Year 11', label: 'Year 11' },
  { value: 'Year 12 / AS', label: 'Year 12 / AS' },
  { value: 'Year 13 / A2', label: 'Year 13 / A2' },
  { value: 'University', label: 'University' },
  { value: 'Adult', label: 'Adult' },
];

const LEARNING_STYLES = [
  { value: 'visual', label: 'Visual' },
  { value: 'auditory', label: 'Auditory' },
  { value: 'reading_writing', label: 'Reading / Writing' },
  { value: 'kinesthetic', label: 'Kinesthetic' },
  { value: 'mixed', label: 'Mixed' },
];

const COMMON_SUBJECTS = ['Maths', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'French', 'Spanish', 'Computer Science', 'Economics'];

interface TuteeFormProps {
  tutee?: Tutee;
  mode: 'create' | 'edit';
}

export function TuteeForm({ tutee, mode }: TuteeFormProps) {
  const router = useRouter();
  const { createTutee, updateTutee } = useTutees();
  const [subjectInput, setSubjectInput] = useState('');
  const [serverError, setServerError] = useState('');

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TuteeFormValues>({
    resolver: zodResolver(tuteeSchema),
    defaultValues: {
      full_name: tutee?.full_name ?? '',
      year_group: tutee?.year_group ?? '',
      age: tutee?.age ?? null,
      subjects: tutee?.subjects ?? [],
      learning_style: tutee?.learning_style ?? '',
      parent_name: tutee?.parent_name ?? '',
      parent_email: tutee?.parent_email ?? '',
      parent_phone: tutee?.parent_phone ?? '',
      notes: tutee?.notes ?? '',
    },
  });

  const subjects = watch('subjects');

  const addSubject = (sub: string) => {
    const trimmed = sub.trim();
    if (trimmed && !subjects.includes(trimmed)) {
      setValue('subjects', [...subjects, trimmed]);
    }
    setSubjectInput('');
  };

  const removeSubject = (sub: string) => {
    setValue('subjects', subjects.filter((s) => s !== sub));
  };

  const onSubmit = async (values: TuteeFormValues) => {
    setServerError('');
    try {
      const payload = {
        full_name: values.full_name,
        year_group: values.year_group || null,
        age: values.age || null,
        subjects: values.subjects,
        learning_style: values.learning_style || null,
        parent_name: values.parent_name || null,
        parent_email: values.parent_email || null,
        parent_phone: values.parent_phone || null,
        notes: values.notes || null,
        is_active: true,
      };

      if (mode === 'create') {
        const created = await createTutee(payload);
        router.push(`/tutees/${created.id}`);
      } else if (tutee) {
        await updateTutee(tutee.id, payload);
        router.push(`/tutees/${tutee.id}`);
      }
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 pb-6">
      <div>
        <h2 className="font-serif text-xl text-text-muted mb-0.5">Basic details</h2>
        <div className="h-px bg-border mb-4" />
        <div className="flex flex-col gap-4">
          <Input label="Full name" {...register('full_name')} error={errors.full_name?.message} autoFocus={mode === 'create'} />
          <div className="grid grid-cols-2 gap-3">
            <Controller
              name="year_group"
              control={control}
              render={({ field }) => (
                <Select
                  label="Year group"
                  options={YEAR_GROUPS}
                  placeholder="Select..."
                  {...field}
                  value={field.value ?? ''}
                />
              )}
            />
            <Input
              label="Age"
              type="number"
              min={4}
              max={100}
              {...register('age', { valueAsNumber: true })}
              error={errors.age?.message}
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-serif text-xl text-text-muted mb-0.5">Subjects</h2>
        <div className="h-px bg-border mb-4" />
        <div className="flex flex-wrap gap-2 mb-3">
          {subjects.map((sub) => (
            <span key={sub} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {sub}
              <button type="button" onClick={() => removeSubject(sub)} className="hover:opacity-60" aria-label={`Remove ${sub}`}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={subjectInput}
            onChange={(e) => setSubjectInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubject(subjectInput); } }}
            placeholder="Type a subject..."
            className="flex-1 h-9 px-3 rounded-lg border border-border bg-surface text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button type="button" size="sm" variant="secondary" onClick={() => addSubject(subjectInput)} disabled={!subjectInput.trim()}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {COMMON_SUBJECTS.filter((s) => !subjects.includes(s)).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addSubject(s)}
              className="px-2.5 py-1 rounded-full border border-border bg-background text-xs text-text-muted hover:border-primary hover:text-primary transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-serif text-xl text-text-muted mb-0.5">Learning</h2>
        <div className="h-px bg-border mb-4" />
        <Controller
          name="learning_style"
          control={control}
          render={({ field }) => (
            <Select
              label="Learning style"
              options={LEARNING_STYLES}
              placeholder="Select..."
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
      </div>

      <div>
        <h2 className="font-serif text-xl text-text-muted mb-0.5">Parent / guardian</h2>
        <div className="h-px bg-border mb-4" />
        <div className="flex flex-col gap-3">
          <Input label="Name" {...register('parent_name')} />
          <Input label="Email" type="email" {...register('parent_email')} error={errors.parent_email?.message} />
          <Input label="Phone" type="tel" {...register('parent_phone')} />
        </div>
      </div>

      <div>
        <h2 className="font-serif text-xl text-text-muted mb-0.5">Notes</h2>
        <div className="h-px bg-border mb-4" />
        <Textarea label="Ongoing observations" {...register('notes')} rows={4} />
      </div>

      {serverError && <p className="text-sm text-rag-red text-center">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting} className="flex-1">
          {mode === 'create' ? 'Create tutee' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
