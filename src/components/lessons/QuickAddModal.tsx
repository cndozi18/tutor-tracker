'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLessons } from '@/hooks/useLessons';
import { useTutees } from '@/hooks/useTutees';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';

interface QuickAddModalProps {
  open: boolean;
  onClose: () => void;
  defaultDate?: string;
  defaultTime?: string;
}

export function QuickAddModal({ open, onClose, defaultDate, defaultTime }: QuickAddModalProps) {
  const router = useRouter();
  const { createLesson } = useLessons();
  const { tutees } = useTutees();
  const [tuteeId, setTuteeId] = useState('');
  const [date, setDate] = useState(defaultDate ?? new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(defaultTime ?? '09:00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tuteeOptions = tutees.map((t) => ({ value: t.id, label: t.full_name }));

  const handleCreate = async () => {
    if (!tuteeId) { setError('Please select a tutee'); return; }
    setLoading(true);
    setError('');
    try {
      const starts_at = new Date(`${date}T${time}:00`).toISOString();
      const lesson = await createLesson({
        tutee_id: tuteeId,
        starts_at,
        duration_mins: 60,
        subject: null,
        plan: null,
        notes: null,
        homework_set: null,
        status: 'scheduled',
      });
      onClose();
      router.push(`/lessons/${lesson.id}/edit`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create lesson');
    }
    setLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose} title="Quick add lesson" variant="sheet">
      <div className="flex flex-col gap-4">
        <Select
          label="Tutee"
          options={tuteeOptions}
          placeholder="Select tutee..."
          value={tuteeId}
          onChange={(e) => setTuteeId(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input label="Time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        {error && <p className="text-sm text-rag-red">{error}</p>}
        <Button onClick={handleCreate} loading={loading} className="w-full mt-1">
          Create lesson
        </Button>
      </div>
    </Modal>
  );
}
