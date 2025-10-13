import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useSpesaCRUD } from '@/hooks/dipendente/useSpesaCRUD';

interface EliminaSpesaDialogProps {
  spesa: {
    id: string;
    causale: string;
    importo: number;
    data_spesa: string;
  };
  open: boolean;
  onClose: (deleted: boolean) => void;
}

export function EliminaSpesaDialog({ spesa, open, onClose }: EliminaSpesaDialogProps) {
  const { deleteSpesa } = useSpesaCRUD();

  const handleConfirm = async () => {
    await deleteSpesa.mutateAsync(spesa.id);
    onClose(true);
  };

  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && onClose(false)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ⚠️ Elimina Spesa
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>Sei sicuro di voler eliminare questa spesa?</p>
            
            <div className="text-foreground font-medium">
              <p>Causale: {spesa.causale}</p>
              <p>Importo: €{spesa.importo.toFixed(2)}</p>
            </div>
            
            <p>Questa azione non può essere annullata.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteSpesa.isPending}>
            Annulla
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleteSpesa.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteSpesa.isPending ? 'Eliminazione...' : 'ELIMINA 🗑️'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
