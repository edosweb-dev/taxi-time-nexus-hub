
import React, { useEffect, useState } from 'react';
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
  // Aggiungiamo uno state per tenere traccia se l'utente ha tentato di eliminare
  const [hasAttemptedDelete, setHasAttemptedDelete] = useState(false);
  
  const handleConfirm = (event: React.MouseEvent) => {
    // Important: Stop event propagation to prevent other handlers from interfering
    event.preventDefault();
    event.stopPropagation();
    console.log('[DeleteReportDialog] handleConfirm called');
    console.log('[DeleteReportDialog] Delete confirmation button clicked, calling onConfirm');
    setHasAttemptedDelete(true); // Memorizziamo che l'utente ha tentato l'eliminazione
    console.log('[DeleteReportDialog] invoking deleteReport');
    onConfirm();
    // Don't close the dialog here - we'll handle this with useEffect based on isDeleting state
  };

  const handleCancel = (event: React.MouseEvent) => {
    // Also stop propagation on cancel to prevent any issues
    event.preventDefault();
    event.stopPropagation();
    setHasAttemptedDelete(false); // Reset stato quando annulla
    onOpenChange(false);
  };

  // Reset lo stato quando il dialogo si apre
  useEffect(() => {
    if (open) {
      console.log('[DeleteReportDialog] Dialog opened, resetting delete attempt state');
      setHasAttemptedDelete(false);
    }
  }, [open]);

  // Close the dialog when deletion completes (isDeleting goes from true to false)
  useEffect(() => {
    console.log('[DeleteReportDialog] isDeleting:', isDeleting, 'hasAttemptedDelete:', hasAttemptedDelete, 'open:', open);
    if (!isDeleting && hasAttemptedDelete && open) {
      console.log('[DeleteReportDialog] Deletion completed, closing dialog after attempt');
      // This timeout ensures that the toast message is visible before the dialog closes
      setTimeout(() => onOpenChange(false), 1000);
    }
  }, [isDeleting, open, onOpenChange, hasAttemptedDelete]);

  return (
    <AlertDialog 
      open={open} 
      onOpenChange={(newOpen) => {
        console.log('[DeleteReportDialog] Dialog open state change requested:', newOpen);
        
        // Blocca la chiusura automatica se sta eliminando
        if (isDeleting && !newOpen) {
          console.log('[DeleteReportDialog] Blocking dialog close during deletion');
          return;
        }
        
        // Se l'utente sta tentando di chiudere senza aver confermato o annullato, permetti la chiusura
        if (!newOpen && !hasAttemptedDelete) {
          console.log('[DeleteReportDialog] Resetting delete attempt state on dialog close');
          setHasAttemptedDelete(false);
        }
        
        onOpenChange(newOpen);
      }}
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
