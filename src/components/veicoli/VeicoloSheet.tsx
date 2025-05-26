
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { VeicoloForm } from './VeicoloForm';
import { Veicolo, VeicoloFormData } from '@/lib/types/veicoli';

interface VeicoloSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  veicolo?: Veicolo;
  onSubmit: (data: VeicoloFormData) => void;
  isSubmitting: boolean;
}

export function VeicoloSheet({
  open,
  onOpenChange,
  veicolo,
  onSubmit,
  isSubmitting,
}: VeicoloSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {veicolo ? 'Modifica Veicolo' : 'Nuovo Veicolo'}
          </SheetTitle>
          <SheetDescription>
            {veicolo 
              ? 'Modifica i dettagli del veicolo esistente.'
              : 'Inserisci i dettagli del nuovo veicolo.'}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <VeicoloForm
            veicolo={veicolo}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
