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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Info } from "lucide-react";

interface DialogConfermaStipendioProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stipendio: any;
  onConfirm: (id: string) => void;
}

const getMeseNome = (mese: number) => {
  const mesi = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];
  return mesi[mese - 1] || '';
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
};

export function DialogConfermaStipendio({
  open,
  onOpenChange,
  stipendio,
  onConfirm
}: DialogConfermaStipendioProps) {
  if (!stipendio) return null;

  const userName = stipendio.user 
    ? `${stipendio.user.first_name || ''} ${stipendio.user.last_name || ''}`.trim()
    : 'Utente';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Conferma Stipendio</AlertDialogTitle>
          <AlertDialogDescription>
            Stai per confermare lo stipendio di{' '}
            <strong>{userName}</strong>
            {' '}per {getMeseNome(stipendio.mese)} {stipendio.anno}.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 p-4 bg-muted rounded-lg">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Totale Lordo:</span>
            <span className="font-medium">
              {formatCurrency(stipendio.totale_lordo || 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Detrazioni:</span>
            <span className="text-destructive">
              -{formatCurrency(
                (stipendio.totale_prelievi || 0) +
                (stipendio.incassi_da_dipendenti || 0)
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Addizioni:</span>
            <span className="text-green-600">
              +{formatCurrency(stipendio.totale_spese || 0)}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between items-center pt-2">
            <span className="text-lg font-semibold">Totale Netto:</span>
            <span className="text-2xl font-bold">
              {formatCurrency(stipendio.totale_netto || 0)}
            </span>
          </div>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Dopo la conferma, lo stipendio non potrà più essere ricalcolato automaticamente.
          </AlertDescription>
        </Alert>

        <AlertDialogFooter>
          <AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirm(stipendio.id)}>
            Conferma Stipendio
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
