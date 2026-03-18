import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LessonForm } from '@/components/lessons/LessonForm';
import type { Lesson } from '@/lib/types/database.types';

interface Props {
  params: { id: string };
}

export default async function EditLessonPage({ params }: Props) {
  const supabase = await createClient();

  const { data: lessonData } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!lessonData) notFound();
  const lesson = lessonData as unknown as Lesson;

  return (
    <div className="px-5 pt-8 pb-6 max-w-lg mx-auto">
      <h1 className="font-serif text-3xl text-text mb-6">Edit lesson</h1>
      <LessonForm lesson={lesson} mode="edit" />
    </div>
  );
}
