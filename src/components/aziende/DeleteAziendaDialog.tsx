
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
import { Azienda } from '@/lib/types';

interface DeleteAziendaDialogProps {
  azienda: Azienda | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteAziendaDialog({ 
  azienda, 
  open, 
  onOpenChange, 
  onConfirm,
  isDeleting = false,
}: DeleteAziendaDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => { if (!isDeleting) onOpenChange(next); }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
          <AlertDialogDescription>
            Sei sicuro di voler eliminare l'azienda <strong className="text-foreground">{azienda?.nome}</strong>?
            <br />
            Questa azione non può essere annullata.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} className="min-h-[44px]">Annulla</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isDeleting}
            className="min-h-[44px] bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? 'Eliminazione in corso...' : 'Elimina'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
