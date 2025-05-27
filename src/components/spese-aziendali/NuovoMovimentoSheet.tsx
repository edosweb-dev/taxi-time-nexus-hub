
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { MovimentoForm } from './MovimentoForm';

interface NuovoMovimentoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NuovoMovimentoSheet({ open, onOpenChange }: NuovoMovimentoSheetProps) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nuovo Movimento</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <MovimentoForm onSuccess={handleSuccess} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
