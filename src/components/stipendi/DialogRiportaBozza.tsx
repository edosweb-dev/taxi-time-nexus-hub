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

interface DialogRiportaBozzaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stipendio: any;
  onConfirm: (stipendioId: string) => void;
}

export function DialogRiportaBozza({
  open,
  onOpenChange,
  stipendio,
  onConfirm,
}: DialogRiportaBozzaProps) {
  if (!stipendio) return null;

  const userName = stipendio.user 
    ? `${stipendio.user.first_name || ''} ${stipendio.user.last_name || ''}`.trim()
    : 'questo utente';

  const meseNome = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ][stipendio.mese - 1];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Riportare stipendio a bozza?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Stai per riportare lo stipendio di <strong>{userName}</strong> ({meseNome} {stipendio.anno}) 
              da <strong>confermato</strong> a <strong>bozza</strong>.
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded p-3 mt-2">
              <p className="text-sm text-orange-800">
                ⚠️ <strong>Cosa succede:</strong>
              </p>
              <ul className="text-sm text-orange-700 mt-2 space-y-1 ml-4 list-disc">
                <li>Lo stipendio tornerà modificabile</li>
                <li>Verrà <strong>ricalcolato automaticamente</strong> con i dati attuali dei servizi</li>
                <li>Dovrai confermare nuovamente lo stipendio quando pronto</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Questa operazione è utile quando servizi vengono consuntivati dopo la conferma.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(stipendio.id)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Riporta a Bozza
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
