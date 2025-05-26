
import React, { useCallback } from 'react';
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
import { Loader2 } from 'lucide-react';

interface DeleteReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export const DeleteReportDialog: React.FC<DeleteReportDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  isDeleting
}) => {
  // Gestione apertura/chiusura dialog - SEMPLIFICATA
  const handleOpenChange = useCallback((newOpen: boolean) => {
    console.log('[DeleteReportDialog] Dialog state change:', newOpen);
    
    // Non bloccare mai la chiusura del dialog
    onOpenChange(newOpen);
  }, [onOpenChange]);

  // Gestione click di conferma
  const handleConfirm = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('[DeleteReportDialog] Confirm button clicked');
    onConfirm();
  }, [onConfirm]);

  // Gestione click di annullamento
  const handleCancel = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('[DeleteReportDialog] Cancel button clicked');
    handleOpenChange(false);
  }, [handleOpenChange]);

  return (
    <AlertDialog 
      open={open} 
      onOpenChange={handleOpenChange}
    >
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
          <AlertDialogDescription>
            Sei sicuro di voler eliminare questo report? 
            Questa azione non può essere annullata e rimuoverà sia il file che il record dal database.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            disabled={isDeleting} 
            onClick={handleCancel}
          >
            Annulla
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Eliminazione...
              </>
            ) : (
              'Elimina'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
