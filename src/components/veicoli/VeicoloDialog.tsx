
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { VeicoloForm } from './VeicoloForm';
import { VeicoloFormData, Veicolo } from '@/lib/types/veicoli';

interface VeicoloDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  veicolo?: Veicolo;
  onSubmit: (data: VeicoloFormData) => void;
  isSubmitting?: boolean;
}

export function VeicoloDialog({
  open,
  onOpenChange,
  veicolo,
  onSubmit,
  isSubmitting,
}: VeicoloDialogProps) {
  const isEditing = !!veicolo;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifica Veicolo' : 'Nuovo Veicolo'}
          </DialogTitle>
        </DialogHeader>
        <VeicoloForm
          initialData={veicolo}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
