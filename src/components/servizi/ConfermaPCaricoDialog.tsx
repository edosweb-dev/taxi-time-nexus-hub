import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useConfermaPCar } from '@/hooks/useConfermaPCar';
import { useVeicoliAttivi } from '@/hooks/useVeicoli';
import { useAssignmentUsers } from '@/hooks/useAssignmentUsers';
import { useImpostazioni } from '@/hooks/useImpostazioni';
import { useIsMobile } from '@/hooks/useIsMobile';
import { formatCurrency } from '@/components/servizi/utils/formatUtils';
import { AlertTriangle } from 'lucide-react';

interface ConfermaPCaricoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servizioId: string;
  dataServizio: string;
  metodoPagamentoIniziale?: string;
  onSuccess?: () => void;
}

export function ConfermaPCaricoDialog({
  open,
  onOpenChange,
  servizioId,
  dataServizio,
  metodoPagamentoIniziale,
  onSuccess,
}: ConfermaPCaricoDialogProps) {
  const [assegnatoA, setAssegnatoA] = useState('');
  const [veicoloId, setVeicoloId] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState(metodoPagamentoIniziale || '');
  const [incassoNetto, setIncassoNetto] = useState('');
  const [note, setNote] = useState('');

  const { mutate: conferma, isPending } = useConfermaPCar();
  const { users } = useAssignmentUsers(dataServizio, servizioId);
  const { veicoli } = useVeicoliAttivi();
  const { impostazioni } = useImpostazioni();
  const isMobile = useIsMobile();

  const metodiPagamento = useMemo(() => {
    return (impostazioni?.metodi_pagamento || []).map(m => m.nome);
  }, [impostazioni]);

  const selectedUser = useMemo(() => {
    if (!assegnatoA) return null;
    return users.find(u => u.id === assegnatoA) || null;
  }, [assegnatoA, users]);

  const calcoloIva = useMemo(() => {
    const netto = parseFloat(incassoNetto) || 0;
    if (!netto || !metodoPagamento || !impostazioni)
      return { ivaApplicabile: false, percentuale: 0, ivaImporto: 0, totaleLordo: netto };

    const metodo = impostazioni.metodi_pagamento?.find(
      (m) => m.nome === metodoPagamento
    );
    if (!metodo?.iva_applicabile)
      return { ivaApplicabile: false, percentuale: 0, ivaImporto: 0, totaleLordo: netto };

    const aliquota = impostazioni.aliquote_iva?.find(
      (a) => a.id === metodo.aliquota_iva
    );
    const percentuale = aliquota?.percentuale || 0;
    const ivaImporto = netto * (percentuale / 100);
    const totaleLordo = netto + ivaImporto;

    return { ivaApplicabile: true, percentuale, ivaImporto, totaleLordo };
  }, [incassoNetto, metodoPagamento, impostazioni]);

  const handleSubmit = () => {
    conferma(
      {
        servizio_id: servizioId,
        assegnato_a: assegnatoA || undefined,
        veicolo_id: veicoloId || undefined,
        metodo_pagamento: metodoPagamento || undefined,
        incasso_netto_previsto: incassoNetto ? parseFloat(incassoNetto) : undefined,
        incasso_previsto: incassoNetto ? calcoloIva.totaleLordo : undefined,
        iva: incassoNetto ? calcoloIva.percentuale : undefined,
        note: note || undefined,
      },
      {
        onSuccess: () => {
          setAssegnatoA('');
          setVeicoloId('');
          setMetodoPagamento(metodoPagamentoIniziale || '');
          setIncassoNetto('');
          setNote('');
          onOpenChange(false);
          onSuccess?.();
        },
      }
    );
  };

  const selectClassName = "flex h-10 w-full max-w-full rounded-md border border-input bg-background px-3 py-2 text-sm truncate ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  const formContent = (
    <>
      <div className="space-y-3">
        {/* Autista */}
        <div className="space-y-1.5">
          <Label>Autista (opzionale)</Label>
          <select
            value={assegnatoA}
            onChange={(e) => setAssegnatoA(e.target.value)}
            className={selectClassName}
          >
            <option value="">-- Assegna dopo --</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.first_name} {user.last_name} — {user.displayStatus}
              </option>
            ))}
          </select>
          {selectedUser && selectedUser.displayStatus === 'Turno assente' && (
            <div className="flex items-center gap-2 rounded-md border border-yellow-300 bg-yellow-50 p-2 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Questo autista non ha un turno programmato per questa data</span>
            </div>
          )}
        </div>

        {/* Veicolo */}
        <div className="space-y-1.5">
          <Label>Veicolo (opzionale)</Label>
          <select
            value={veicoloId}
            onChange={(e) => setVeicoloId(e.target.value)}
            className={selectClassName}
          >
            <option value="">-- Seleziona veicolo --</option>
            {(veicoli || []).map((v) => (
              <option key={v.id} value={v.id}>
                {v.modello} - {v.targa}
              </option>
            ))}
          </select>
        </div>

        {/* Sezione Economica */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-sm font-medium">💰 Dettagli Economici</span>
          <Separator className="flex-1" />
        </div>

        {/* Metodo di Pagamento */}
        <div className="space-y-1.5">
          <Label>Metodo di Pagamento (opzionale)</Label>
          <select
            value={metodoPagamento}
            onChange={(e) => setMetodoPagamento(e.target.value)}
            className={selectClassName}
          >
            <option value="">-- Seleziona metodo --</option>
            {metodiPagamento.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Incasso Netto Previsto */}
        <div className="space-y-1.5">
          <Label>Incasso Netto Previsto (opzionale)</Label>
          <Input
            type="number"
            placeholder="es. 250.00"
            value={incassoNetto}
            onChange={(e) => setIncassoNetto(e.target.value)}
          />
          {parseFloat(incassoNetto) > 0 && (
            <div className="border-l-2 border-muted-foreground/30 pl-3 space-y-0.5">
              {calcoloIva.ivaApplicabile ? (
                <>
                  <p className="text-xs text-muted-foreground">
                    IVA {calcoloIva.percentuale}%: {formatCurrency(calcoloIva.ivaImporto)}
                  </p>
                  <p className="text-xs font-medium text-foreground">
                    Totale lordo: {formatCurrency(calcoloIva.totaleLordo)}
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  IVA: esente ({metodoPagamento || 'nessun metodo'})
                </p>
              )}
            </div>
          )}
        </div>

        {/* Note */}
        <div className="space-y-1.5">
          <Label>Note Aggiuntive (opzionale)</Label>
          <Textarea
            placeholder="Note per il servizio..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isPending}
        >
          Annulla
        </Button>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? 'Conferma in corso...' : '✅ Conferma Presa in Carico'}
        </Button>
      </div>
    </>
  );

  const title = '✅ Conferma Presa in Carico';
  const description = 'Compila i dettagli del servizio e conferma la presa in carico. Verrà inviata email di conferma al cliente con il percorso completo.';

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="w-full max-h-[90vh] overflow-y-auto px-4 pb-4 pt-0">
          <SheetHeader className="pb-2">
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          {formContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95vw] sm:w-full p-4">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
