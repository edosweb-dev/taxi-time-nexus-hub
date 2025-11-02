
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { MovimentoForm } from './MovimentoForm';

interface NuovoMovimentoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTipoCausale?: 'generica' | 'f24' | 'pagamento_fornitori' | 'spese_gestione' | 'multe' | 'fattura_conducenti_esterni';
}

export function NuovoMovimentoSheet({ open, onOpenChange, defaultTipoCausale }: NuovoMovimentoSheetProps) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  const getTitle = () => {
    if (defaultTipoCausale === 'f24') return '📄 Registra F24';
    if (defaultTipoCausale === 'pagamento_fornitori') return '🏢 Pagamento Fornitori';
    if (defaultTipoCausale === 'spese_gestione') return '⚙️ Spese di Gestione';
    if (defaultTipoCausale === 'multe') return '🚨 Registra Multa';
    if (defaultTipoCausale === 'fattura_conducenti_esterni') return '🚗 Fattura Conducenti Esterni';
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
