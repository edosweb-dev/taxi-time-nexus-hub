
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
import { Badge } from '@/components/ui/badge';
import { Stipendio, StatoStipendio } from '@/lib/api/stipendi';
import { formatCurrency } from '@/lib/utils';
import { CheckCircle, CreditCard } from 'lucide-react';

interface ConfermaStatoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stipendio: Stipendio | null;
  nuovoStato: StatoStipendio;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfermaStatoDialog({
  open,
  onOpenChange,
  stipendio,
  nuovoStato,
  onConfirm,
  isLoading = false
}: ConfermaStatoDialogProps) {
  if (!stipendio) return null;

  const getStatoInfo = () => {
    switch (nuovoStato) {
      case 'confermato':
        return {
          title: 'Conferma Stipendio',
          description: 'Sei sicuro di voler confermare questo stipendio? Una volta confermato non potrà più essere modificato.',
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          buttonText: 'Conferma Stipendio',
          buttonClass: 'bg-green-600 hover:bg-green-700'
        };
      case 'pagato':
        return {
          title: 'Segna come Pagato',
          description: 'Sei sicuro di voler segnare questo stipendio come pagato? Verrà automaticamente creata una spesa aziendale corrispondente.',
          icon: <CreditCard className="h-5 w-5 text-blue-600" />,
          buttonText: 'Segna come Pagato',
          buttonClass: 'bg-blue-600 hover:bg-blue-700'
        };
      default:
        return {
          title: 'Cambia Stato',
          description: 'Sei sicuro di voler cambiare lo stato di questo stipendio?',
          icon: null,
          buttonText: 'Conferma',
          buttonClass: ''
        };
    }
  };

  const statoInfo = getStatoInfo();
  const months = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {statoInfo.icon}
            {statoInfo.title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {statoInfo.description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Informazioni dipendente */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Dipendente:</span>
              <span>{stipendio.user?.first_name} {stipendio.user?.last_name}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Periodo:</span>
              <span>{months[stipendio.mese - 1]} {stipendio.anno}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Importo:</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(Number(stipendio.totale_netto) || 0)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Stato attuale:</span>
              <Badge variant={stipendio.stato === 'bozza' ? 'secondary' : 'default'}>
                {stipendio.stato}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Nuovo stato:</span>
              <Badge variant="default">
                {nuovoStato}
              </Badge>
            </div>
          </div>

          {/* Avviso specifico per pagato */}
          {nuovoStato === 'pagato' && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Segnando questo stipendio come pagato verrà automaticamente creata una spesa aziendale di {formatCurrency(Number(stipendio.totale_netto) || 0)} nella data odierna.
              </p>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Annulla
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={statoInfo.buttonClass}
          >
            {isLoading ? 'Elaborazione...' : statoInfo.buttonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
