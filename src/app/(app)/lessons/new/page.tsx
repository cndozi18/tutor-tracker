'use client';

import { useSearchParams } from 'next/navigation';
import { LessonForm } from '@/components/lessons/LessonForm';

export default function NewLessonPage() {
  const searchParams = useSearchParams();
  const tuteeId = searchParams.get('tuteeId') ?? undefined;
  const date = searchParams.get('date') ?? undefined;

  return (
    <div className="px-5 pt-8 pb-6 max-w-lg mx-auto">
      <h1 className="font-serif text-3xl text-text mb-6">New lesson</h1>
      <LessonForm mode="create" defaultTuteeId={tuteeId} defaultDate={date} />
    </div>
  );
}
