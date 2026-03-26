'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface LessonActionsProps {
  lessonId: string;
  seriesId: string | null;
  startsAt: string;
  recurrenceRule: 'weekly' | 'biweekly' | null;
}

export function LessonActions({ lessonId, seriesId, startsAt, recurrenceRule }: LessonActionsProps) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const deleteThisLesson = async () => {
    setLoading(true);
    try {
      await supabase.from('lessons').delete().eq('id', lessonId);
      router.back();
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const deleteFutureInSeries = async () => {
    setLoading(true);
    try {
      await supabase.from('lessons').delete().eq('series_id', seriesId).gte('starts_at', startsAt);
      router.back();
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  if (!seriesId) {
    return (
      <>
        <Button variant="danger" size="sm" onClick={() => setShowDialog(true)}>
          Delete
        </Button>
        <ConfirmDialog
          open={showDialog}
          title="Delete lesson?"
          message="This lesson will be permanently deleted. This cannot be undone."
          confirmLabel="Delete lesson"
          onConfirm={deleteThisLesson}
          onCancel={() => setShowDialog(false)}
          loading={loading}
        />
      </>
    );
  }

  const ruleLabel = recurrenceRule === 'weekly' ? 'weekly' : 'bi-weekly';

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setShowDialog(true)}>
        Delete
      </Button>
      <Modal open={showDialog} onClose={() => setShowDialog(false)} title="Delete lesson?" variant="dialog">
        <p className="text-sm text-text-muted mb-5">
          This lesson is part of a recurring {ruleLabel} series. What would you like to delete?
        </p>
        <div className="flex flex-col gap-3">
          <Button variant="secondary" onClick={deleteThisLesson} loading={loading} className="w-full">
            Delete this lesson only
          </Button>
          <Button variant="danger" onClick={deleteFutureInSeries} loading={loading} className="w-full">
            Delete this and all future lessons
          </Button>
          <Button variant="ghost" onClick={() => setShowDialog(false)} disabled={loading} className="w-full">
            Cancel
          </Button>
        </div>
      </Modal>
    </>
  );
}
