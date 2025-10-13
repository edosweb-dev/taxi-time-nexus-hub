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
import { Shift } from '@/lib/utils/turniHelpers';
import { getTurnoBadge, formatItalianDate } from '@/lib/utils/turniHelpers';
import { parseISO } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface EliminaTurnoDialogProps {
  turno: Shift | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function EliminaTurnoDialog({
  turno,
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: EliminaTurnoDialogProps) {
  if (!turno) return null;

  const badge = getTurnoBadge(turno);
  const shiftDate = parseISO(turno.shift_date);

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>⚠️ Elimina Turno</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Sei sicuro di voler eliminare questo turno?</p>
            <div className="mt-4 space-y-1 text-sm">
              <p><strong>Data:</strong> {formatItalianDate(shiftDate)}</p>
              <p><strong>Tipo:</strong> {badge.label}</p>
            </div>
            <p className="mt-4 text-destructive">
              Questa azione non può essere annullata.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Annulla</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Eliminazione...
              </>
            ) : (
              '🗑️ Elimina'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
