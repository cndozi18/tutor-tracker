'use client';

import { useState } from 'react';
import { useTopicProgress } from '@/hooks/useTopicProgress';
import { RagChip } from '@/components/ui/RagChip';
import { Button } from '@/components/ui/Button';
import type { Tutee } from '@/lib/types/database.types';

interface TopicProgressPanelProps {
  tutee: Tutee;
}

export function TopicProgressPanel({ tutee }: TopicProgressPanelProps) {
  const { grouped, loading, addTopic, updateStatus, removeTopic } = useTopicProgress(tutee.id);
  const [newTopics, setNewTopics] = useState<Record<string, string>>({});

  const subjects = tutee.subjects ?? [];

  const handleAddTopic = async (subject: string) => {
    const topicName = newTopics[subject]?.trim();
    if (!topicName) return;

    try {
      await addTopic(subject, topicName);
      setNewTopics((prev) => ({ ...prev, [subject]: '' }));
    } catch (err) {
      console.error('Failed to add topic:', err);
    }
  };

  if (loading) return null;

  if (subjects.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted text-sm">
        Add subjects to this tutee to track topic progress.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {subjects.map((subject) => {
        const subjectTopics = grouped[subject] ?? [];
        return (
          <div key={subject}>
            {/* Section header */}
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-serif text-lg text-text">{subject}</h3>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* RAG chips */}
            <div className="flex flex-wrap gap-2 mb-3">
              {subjectTopics.map((tp) => (
                <RagChip
                  key={tp.id}
                  topic={tp.topic}
                  status={tp.rag_status}
                  onStatusChange={(status) => updateStatus(tp.id, status)}
                  onRemove={() => removeTopic(tp.id)}
                />
              ))}
              {subjectTopics.length === 0 && (
                <p className="text-sm text-text-muted italic">No topics yet</p>
              )}
            </div>

            {/* Add new topic */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTopics[subject] ?? ''}
                onChange={(e) => setNewTopics((prev) => ({ ...prev, [subject]: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTopic(subject); } }}
                placeholder={`Add ${subject} topic...`}
                className="flex-1 h-9 px-3 rounded-lg border border-border bg-surface text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleAddTopic(subject)}
                disabled={!newTopics[subject]?.trim()}
              >
                Add
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
