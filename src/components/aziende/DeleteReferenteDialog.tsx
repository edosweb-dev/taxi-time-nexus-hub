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
import { Profile } from '@/lib/types';

interface DeleteReferenteDialogProps {
  referente: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteReferenteDialog({ 
  referente, 
  open, 
  onOpenChange, 
  onConfirm 
}: DeleteReferenteDialogProps) {
  const refName = referente 
    ? `${referente.first_name || ''} ${referente.last_name || ''}`.trim() || 'questo referente'
    : 'questo referente';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
          <AlertDialogDescription>
            Sei sicuro di voler eliminare <strong className="text-foreground">{refName}</strong>?
            <br />
            Questa azione non può essere annullata.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="min-h-[44px]">Annulla</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="min-h-[44px] bg-destructive hover:bg-destructive/90"
          >
            Elimina
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
