import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TabellaMovimentiPending } from './TabellaMovimentiPending';

interface PagamentiPendingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PagamentiPendingDialog({ open, onOpenChange }: PagamentiPendingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Pagamenti in Sospeso - Filtro Mensile</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <TabellaMovimentiPending />
        </div>
      </DialogContent>
    </Dialog>
  );
}
