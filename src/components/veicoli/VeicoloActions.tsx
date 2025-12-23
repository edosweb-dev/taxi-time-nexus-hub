import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Veicolo } from '@/lib/types/veicoli';
import { useDeactivateVeicolo, useReactivateVeicolo, useHardDeleteVeicolo } from '@/hooks/useVeicoli';
import { Power, ToggleRight, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VeicoloActionsProps {
  veicolo: Veicolo;
  onEdit: (veicolo: Veicolo) => void;
  variant?: 'desktop' | 'mobile';
}

export function VeicoloActions({ veicolo, onEdit, variant = 'desktop' }: VeicoloActionsProps) {
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deactivateMutation = useDeactivateVeicolo();
  const reactivateMutation = useReactivateVeicolo();
  const hardDeleteMutation = useHardDeleteVeicolo();

  const handleDeactivate = () => {
    deactivateMutation.mutate(veicolo.id, {
      onSuccess: () => setShowDeactivateDialog(false),
    });
  };

  const handleReactivate = () => {
    reactivateMutation.mutate(veicolo.id);
  };

  const handleHardDelete = () => {
    hardDeleteMutation.mutate(veicolo.id, {
      onSuccess: () => setShowDeleteDialog(false),
    });
  };

  const isLoading = deactivateMutation.isPending || reactivateMutation.isPending || hardDeleteMutation.isPending;

  if (veicolo.attivo) {
    // Veicolo ATTIVO: mostra Disattiva
    return (
      <>
        <Button
          onClick={() => setShowDeactivateDialog(true)}
          variant="ghost"
          size={variant === 'mobile' ? 'sm' : 'sm'}
          disabled={isLoading}
          className={cn(
            variant === 'mobile' 
              ? "flex-1 h-9 text-xs font-medium text-amber-600 bg-amber-500/10 hover:bg-amber-500/20"
              : "text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
          )}
        >
          {deactivateMutation.isPending ? (
            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
          ) : (
            <Power className="h-3.5 w-3.5 mr-1" />
          )}
          Disattiva
        </Button>

        <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Disattivare veicolo?</AlertDialogTitle>
              <AlertDialogDescription>
                Stai per disattivare <strong>{veicolo.modello} - {veicolo.targa}</strong>.
                <br /><br />
                Il veicolo non sarà più selezionabile per nuovi servizi.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deactivateMutation.isPending}>
                Annulla
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeactivate}
                disabled={deactivateMutation.isPending}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {deactivateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Disattivazione...
                  </>
                ) : (
                  'Disattiva'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  } else {
    // Veicolo INATTIVO: mostra Riattiva + Elimina definitivamente
    return (
      <>
        <div className={cn(
          "flex gap-2",
          variant === 'mobile' && "flex-1"
        )}>
          <Button
            onClick={handleReactivate}
            variant="ghost"
            size="sm"
            disabled={isLoading}
            className={cn(
              variant === 'mobile'
                ? "flex-1 h-9 text-xs font-medium text-green-600 bg-green-500/10 hover:bg-green-500/20"
                : "text-green-600 hover:text-green-700 hover:bg-green-500/10"
            )}
          >
            {reactivateMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <ToggleRight className="h-3.5 w-3.5 mr-1" />
            )}
            Riattiva
          </Button>

          <Button
            onClick={() => setShowDeleteDialog(true)}
            variant="ghost"
            size="sm"
            disabled={isLoading}
            className={cn(
              variant === 'mobile'
                ? "flex-1 h-9 text-xs font-medium text-destructive bg-destructive/10 hover:bg-destructive/20"
                : "text-destructive hover:text-destructive hover:bg-destructive/10"
            )}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Elimina
          </Button>
        </div>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive flex items-center gap-2">
                ⚠️ Elimina veicolo definitivamente?
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  Stai per eliminare definitivamente:
                </p>
                <p className="font-semibold text-foreground">
                  {veicolo.modello} - {veicolo.targa}
                </p>
                <p className="text-destructive font-medium">
                  Questa azione è IRREVERSIBILE.
                </p>
                <p className="text-sm">
                  I servizi storici che usavano questo veicolo mostreranno "Veicolo non più disponibile".
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={hardDeleteMutation.isPending}>
                Annulla
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleHardDelete}
                disabled={hardDeleteMutation.isPending}
                className="bg-destructive hover:bg-destructive/90"
              >
                {hardDeleteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Eliminazione...
                  </>
                ) : (
                  'Elimina definitivamente'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }
}
