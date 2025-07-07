import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConducenteEsternoForm } from './ConducenteEsternoForm';
import { ConducenteEsterno } from '@/lib/types/conducenti-esterni';

interface ConducenteEsternoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conducente?: ConducenteEsterno | null;
  mode: 'create' | 'edit';
}

export function ConducenteEsternoDialog({
  open,
  onOpenChange,
  conducente,
  mode
}: ConducenteEsternoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nuovo Conducente Esterno' : 'Modifica Conducente Esterno'}
          </DialogTitle>
        </DialogHeader>
        
        <ConducenteEsternoForm
          conducente={conducente}
          mode={mode}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}