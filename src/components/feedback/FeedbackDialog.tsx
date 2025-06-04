
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FeedbackForm } from './FeedbackForm';

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invia Feedback</DialogTitle>
          <DialogDescription>
            Aiutaci a migliorare la piattaforma condividendo i tuoi commenti e suggerimenti.
          </DialogDescription>
        </DialogHeader>
        <FeedbackForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
