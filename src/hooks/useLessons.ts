'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Lesson } from '@/lib/types/database.types';

type CreateLessonValues = Omit<Lesson, 'id' | 'tutor_id' | 'created_at' | 'updated_at' | 'series_id' | 'recurrence_rule'> & {
  series_id?: string | null;
  recurrence_rule?: 'weekly' | 'biweekly' | null;
};

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

  const createLesson = async (values: CreateLessonValues): Promise<Lesson> => {
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

  const createRecurringSeries = async (
    baseValues: CreateLessonValues,
    recurrence: { rule: 'weekly' | 'biweekly'; endDate?: string; occurrences?: number }
  ): Promise<Lesson[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const seriesId = crypto.randomUUID();
    const intervalDays = recurrence.rule === 'weekly' ? 7 : 14;

    const firstDate = new Date(baseValues.starts_at);
    let maxDate: Date;
    if (recurrence.endDate) {
      maxDate = new Date(`${recurrence.endDate}T23:59:59`);
    } else {
      maxDate = new Date(firstDate);
      maxDate.setMonth(maxDate.getMonth() + 3);
    }

    const maxOccurrences = recurrence.occurrences ?? Infinity;

    const dates: Date[] = [];
    let current = new Date(firstDate);
    while (current <= maxDate && dates.length < maxOccurrences) {
      dates.push(new Date(current));
      current = new Date(current.getTime() + intervalDays * 24 * 60 * 60 * 1000);
    }

    const rows = dates.map((date) => ({
      ...baseValues,
      starts_at: date.toISOString(),
      tutor_id: user.id,
      series_id: seriesId,
      recurrence_rule: recurrence.rule,
    }));

    const { data, error } = await supabase.from('lessons').insert(rows).select();
    if (error) throw error;
    const created = data as unknown as Lesson[];
    setLessons((prev) =>
      [...created, ...prev].sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime())
    );
    return created;
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

  const updateFutureLessons = async (
    seriesId: string,
    fromStartsAt: string,
    timeStr: string,
    durationMins: number,
    subject: string | null
  ): Promise<void> => {
    const { data } = await supabase
      .from('lessons')
      .select('id, starts_at')
      .eq('series_id', seriesId)
      .gte('starts_at', fromStartsAt)
      .order('starts_at');

    if (!data || data.length === 0) return;

    for (const l of data as { id: string; starts_at: string }[]) {
      const datePart = new Date(l.starts_at).toISOString().slice(0, 10);
      const newStartsAt = new Date(`${datePart}T${timeStr}:00`).toISOString();
      await supabase.from('lessons').update({ starts_at: newStartsAt, duration_mins: durationMins, subject }).eq('id', l.id);
    }

    await fetchLessons();
  };

  const deleteLesson = async (id: string) => {
    const { error } = await supabase.from('lessons').delete().eq('id', id);
    if (error) throw error;
    setLessons((prev) => prev.filter((l) => l.id !== id));
  };

  return { lessons, loading, createLesson, createRecurringSeries, updateLesson, updateFutureLessons, deleteLesson, refetch: fetchLessons };
}
