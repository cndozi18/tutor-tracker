import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TuteeForm } from '@/components/tutees/TuteeForm';
import type { Tutee } from '@/lib/types/database.types';

interface Props {
  params: { id: string };
}

export default async function EditTuteePage({ params }: Props) {
  const supabase = await createClient();

  const { data: tuteeData } = await supabase
    .from('tutees')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!tuteeData) notFound();
  const tutee = tuteeData as unknown as Tutee;

  return (
    <div className="px-5 pt-8 pb-6 max-w-lg mx-auto">
      <h1 className="font-serif text-3xl text-text mb-6">Edit tutee</h1>
      <TuteeForm tutee={tutee} mode="edit" />
    </div>
  );
}
