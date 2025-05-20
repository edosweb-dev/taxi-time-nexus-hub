
import React, { useEffect, useCallback } from 'react';
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
  // Usiamo useCallback per evitare che la funzione cambi ad ogni render
  const handleOpenChange = useCallback((newOpen: boolean) => {
    console.log('[DeleteReportDialog] Dialog open state change requested:', newOpen);
    
    // Blocca la chiusura automatica se sta eliminando
    if (isDeleting && !newOpen) {
      console.log('[DeleteReportDialog] Blocking dialog close during deletion');
      return;
    }
    
    // Altrimenti, permetti la chiusura e passa lo stato al componente genitore
    onOpenChange(newOpen);
  }, [isDeleting, onOpenChange]);

  // Gestiamo il click di conferma
  const handleConfirm = useCallback((event: React.MouseEvent) => {
    // Fermiamo la propagazione dell'evento per evitare interferenze
    event.preventDefault();
    event.stopPropagation();
    console.log('[DeleteReportDialog] handleConfirm called');
    onConfirm();
  }, [onConfirm]);

  // Gestiamo il click di annullamento
  const handleCancel = useCallback((event: React.MouseEvent) => {
    // Fermiamo anche qui la propagazione dell'evento
    event.preventDefault();
    event.stopPropagation();
    handleOpenChange(false);
  }, [handleOpenChange]);

  // Log per debug quando il dialog cambia stato
  useEffect(() => {
    console.log('[DeleteReportDialog] Dialog open state:', open, 'isDeleting:', isDeleting);
  }, [open, isDeleting]);

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
