'use client';

import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  loading,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} variant="dialog">
      <p className="text-sm text-text-muted mb-6">{message}</p>
      <div className="flex flex-col gap-3">
        <Button variant="danger" onClick={onConfirm} loading={loading} className="w-full">
          {confirmLabel}
        </Button>
        <Button variant="secondary" onClick={onCancel} disabled={loading} className="w-full">
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
