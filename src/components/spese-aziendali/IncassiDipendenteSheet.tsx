
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface IncassiDipendenteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IncassiDipendenteSheet({ open, onOpenChange }: IncassiDipendenteSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Converti Spese Dipendenti in Incassi</SheetTitle>
        </SheetHeader>
        <div className="mt-6 text-center text-muted-foreground">
          <p>Funzionalità in arrivo...</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
