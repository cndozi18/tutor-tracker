'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface TuteeActionsProps {
  tuteeId: string;
  tuteeName: string;
}

export function TuteeActions({ tuteeId, tuteeName }: TuteeActionsProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      const { error: err } = await supabase.from('tutees').delete().eq('id', tuteeId);
      if (err) throw err;
      router.push('/tutees');
      router.refresh();
    } catch {
      setError('Failed to delete. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setShowConfirm(true)}>
        Delete
      </Button>
      {error && <p className="text-xs text-rag-red mt-1">{error}</p>}
      <ConfirmDialog
        open={showConfirm}
        title={`Delete ${tuteeName}?`}
        message={`This will permanently delete ${tuteeName} along with all their lessons and topic progress. This cannot be undone.`}
        confirmLabel="Delete tutee"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        loading={loading}
      />
    </>
  );
}
