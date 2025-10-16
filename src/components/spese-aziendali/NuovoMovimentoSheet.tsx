
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { MovimentoForm } from './MovimentoForm';

interface NuovoMovimentoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTipoCausale?: 'generica' | 'f24' | 'stipendio';
}

export function NuovoMovimentoSheet({ open, onOpenChange, defaultTipoCausale }: NuovoMovimentoSheetProps) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  const getTitle = () => {
    if (defaultTipoCausale === 'stipendio') return '💰 Registra Stipendio';
    if (defaultTipoCausale === 'f24') return '📄 Registra F24';
    return 'Nuovo Movimento';
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{getTitle()}</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <MovimentoForm onSuccess={handleSuccess} defaultTipoCausale={defaultTipoCausale} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
