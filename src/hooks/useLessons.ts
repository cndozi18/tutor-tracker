'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Lesson } from '@/lib/types/database.types';

export function useLessons(options?: { tuteeId?: string; startDate?: string; endDate?: string }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('lessons').select('*, tutees(full_name, subjects)').order('starts_at', { ascending: false });

    if (options?.tuteeId) query = query.eq('tutee_id', options.tuteeId);
    if (options?.startDate) query = query.gte('starts_at', options.startDate);
    if (options?.endDate) query = query.lte('starts_at', options.endDate);

    const { data } = await query;
    setLessons((data as Lesson[]) ?? []);
    setLoading(false);
  }, [options?.tuteeId, options?.startDate, options?.endDate]);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);

  const createLesson = async (values: Omit<Lesson, 'id' | 'tutor_id' | 'created_at' | 'updated_at'>): Promise<Lesson> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('lessons')
      .insert({ ...values, tutor_id: user.id })
      .select()
      .single();

    if (error) throw error;
    const lesson = data as unknown as Lesson;
    setLessons((prev) => [lesson, ...prev]);
    return lesson;
  };

  const updateLesson = async (id: string, values: Partial<Lesson>): Promise<Lesson> => {
    const { data, error } = await supabase
      .from('lessons')
      .update(values)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    const lesson = data as unknown as Lesson;
    setLessons((prev) => prev.map((l) => (l.id === id ? lesson : l)));
    return lesson;
  };

  const deleteLesson = async (id: string) => {
    const { error } = await supabase.from('lessons').delete().eq('id', id);
    if (error) throw error;
    setLessons((prev) => prev.filter((l) => l.id !== id));
  };

  return { lessons, loading, createLesson, updateLesson, deleteLesson, refetch: fetchLessons };
}
