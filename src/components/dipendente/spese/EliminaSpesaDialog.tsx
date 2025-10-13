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
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && onClose(false)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <span>⚠️</span>
            Elimina Spesa
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>Sei sicuro di voler eliminare questa spesa?</p>
              
              <div className="space-y-2 p-3 bg-muted rounded-md text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data:</span>
                  <span className="font-medium text-foreground">
                    {format(parseISO(spesa.data_spesa), 'dd/MM/yyyy', { locale: it })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Causale:</span>
                  <span className="font-medium text-foreground">{spesa.causale}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Importo:</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(spesa.importo)}
                  </span>
                </div>
              </div>

              <p className="text-destructive">
                Questa azione non può essere annullata.
              </p>
            </div>
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
            {deleteSpesa.isPending ? 'Eliminazione...' : 'Elimina'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
