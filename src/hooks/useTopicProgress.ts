'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { TopicProgress } from '@/lib/types/database.types';

type GroupedTopics = Record<string, TopicProgress[]>;

export function useTopicProgress(tuteeId: string) {
  const [topics, setTopics] = useState<TopicProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('topic_progress')
      .select('*')
      .eq('tutee_id', tuteeId)
      .order('subject')
      .order('topic');

    setTopics((data as unknown as TopicProgress[]) ?? []);
    setLoading(false);
  }, [tuteeId]);

  useEffect(() => { fetchTopics(); }, [fetchTopics]);

  const grouped: GroupedTopics = topics.reduce((acc, topic) => {
    if (!acc[topic.subject]) acc[topic.subject] = [];
    acc[topic.subject].push(topic);
    return acc;
  }, {} as GroupedTopics);

  const addTopic = async (subject: string, topicName: string): Promise<TopicProgress> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('topic_progress')
      .insert({
        tutor_id: user.id,
        tutee_id: tuteeId,
        subject,
        topic: topicName,
        rag_status: 'amber',
      })
      .select()
      .single();

    if (error) throw error;
    const tp = data as unknown as TopicProgress;
    setTopics((prev) => [...prev, tp]);
    return tp;
  };

  const updateStatus = async (id: string, rag_status: 'red' | 'amber' | 'green'): Promise<TopicProgress> => {
    const { data, error } = await supabase
      .from('topic_progress')
      .update({ rag_status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    const tp = data as unknown as TopicProgress;
    setTopics((prev) => prev.map((t) => (t.id === id ? tp : t)));
    return tp;
  };

  const removeTopic = async (id: string) => {
    const { error } = await supabase.from('topic_progress').delete().eq('id', id);
    if (error) throw error;
    setTopics((prev) => prev.filter((t) => t.id !== id));
  };

  return { topics, grouped, loading, addTopic, updateStatus, removeTopic, refetch: fetchTopics };
}
