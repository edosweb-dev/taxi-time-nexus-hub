
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { FeedbackForm } from './FeedbackForm';

interface FeedbackSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackSheet({ open, onOpenChange }: FeedbackSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Invia Feedback</SheetTitle>
          <SheetDescription>
            Aiutaci a migliorare la piattaforma condividendo i tuoi commenti e suggerimenti.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <FeedbackForm onSuccess={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
