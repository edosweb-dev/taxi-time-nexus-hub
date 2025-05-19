
import React, { useEffect } from 'react';
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
  const handleConfirm = (event: React.MouseEvent) => {
    // Important: Stop event propagation to prevent other handlers from interfering
    event.preventDefault();
    event.stopPropagation();
    console.log('Delete confirmation button clicked, calling onConfirm');
    onConfirm();
    // Don't close the dialog here - we'll handle this with useEffect based on isDeleting state
  };

  const handleCancel = (event: React.MouseEvent) => {
    // Also stop propagation on cancel to prevent any issues
    event.preventDefault();
    event.stopPropagation();
    onOpenChange(false);
  };

  // Close the dialog when deletion completes (isDeleting goes from true to false)
  useEffect(() => {
    if (!isDeleting && open) {
      console.log('Deletion completed, checking if we should close dialog');
      // This timeout ensures that the toast message is visible before the dialog closes
      setTimeout(() => onOpenChange(false), 500);
    }
  }, [isDeleting, open, onOpenChange]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
