'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Tutee } from '@/lib/types/database.types';

export function useTutees() {
  const [tutees, setTutees] = useState<Tutee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchTutees = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tutees')
      .select('*')
      .eq('is_active', true)
      .order('full_name');

    if (error) setError(error.message);
    else setTutees((data as unknown as Tutee[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTutees(); }, [fetchTutees]);

  const createTutee = async (values: Omit<Tutee, 'id' | 'tutor_id' | 'created_at' | 'updated_at'>): Promise<Tutee> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('tutees')
      .insert({ ...values, tutor_id: user.id })
      .select()
      .single();

    if (error) throw error;
    const tutee = data as unknown as Tutee;
    setTutees((prev) => [...prev, tutee].sort((a, b) => a.full_name.localeCompare(b.full_name)));
    return tutee;
  };

  const updateTutee = async (id: string, values: Partial<Tutee>): Promise<Tutee> => {
    const { data, error } = await supabase
      .from('tutees')
      .update(values)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    const tutee = data as unknown as Tutee;
    setTutees((prev) => prev.map((t) => (t.id === id ? tutee : t)));
    return tutee;
  };

  const deleteTutee = async (id: string) => {
    const { error } = await supabase
      .from('tutees')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setTutees((prev) => prev.filter((t) => t.id !== id));
  };

  const searchTutees = useCallback(async (query: string): Promise<Tutee[]> => {
    if (!query.trim()) {
      const { data } = await supabase
        .from('tutees')
        .select('*')
        .eq('is_active', true)
        .order('full_name');
      return (data as unknown as Tutee[]) ?? [];
    }

    const { data } = await supabase
      .from('tutees')
      .select('*')
      .eq('is_active', true)
      .textSearch('full_name', query, { type: 'websearch' })
      .order('full_name');

    return (data as unknown as Tutee[]) ?? [];
  }, []);

  return { tutees, loading, error, createTutee, updateTutee, deleteTutee, searchTutees, refetch: fetchTutees };
}
