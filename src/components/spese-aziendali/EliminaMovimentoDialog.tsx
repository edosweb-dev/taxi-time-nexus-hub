import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSpeseAziendali } from '@/hooks/useSpeseAziendali';

interface EliminaMovimentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movimento: any;
}

export function EliminaMovimentoDialog({ open, onOpenChange, movimento }: EliminaMovimentoDialogProps) {
  const { deleteMovimento } = useSpeseAziendali();

  const handleDelete = async () => {
    if (!movimento?.id) return;
    await deleteMovimento.mutateAsync(movimento.id);
    onOpenChange(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Elimina Movimento</AlertDialogTitle>
          <AlertDialogDescription>
            Sei sicuro di voler eliminare questo movimento?
            <br /><br />
            <strong>Causale:</strong> {movimento?.causale}<br />
            <strong>Importo:</strong> {formatCurrency(Number(movimento?.importo || 0))}<br />
            <strong>Tipologia:</strong> {movimento?.tipologia}
            <br /><br />
            Questa azione non può essere annullata.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMovimento.isPending ? 'Eliminazione...' : 'Elimina'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
