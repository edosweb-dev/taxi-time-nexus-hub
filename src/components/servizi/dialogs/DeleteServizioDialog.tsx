import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface DeleteServizioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  servizioId?: string;
  isDeleting?: boolean;
}

export function DeleteServizioDialog({
  open,
  onOpenChange,
  onConfirm,
  servizioId,
  isDeleting = false
}: DeleteServizioDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle className="text-left">
              Eliminare definitivamente questo servizio?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left space-y-2 pt-2">
            <p className="font-semibold text-destructive">
              ⚠️ ATTENZIONE: Questa azione è IRREVERSIBILE!
            </p>
            <p>
              Il servizio e tutti i dati correlati (passeggeri, notifiche email) 
              verranno eliminati permanentemente dal database.
            </p>
            <p className="text-sm text-muted-foreground">
              Non sarà possibile recuperare questi dati in futuro.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Annulla
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Eliminazione...' : 'Elimina Definitivamente'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
