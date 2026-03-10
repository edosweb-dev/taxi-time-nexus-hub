import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useConfermaPCar } from '@/hooks/useConfermaPCar';
import { useVeicoliAttivi } from '@/hooks/useVeicoli';
import { useAssignmentUsers } from '@/hooks/useAssignmentUsers';
import { useImpostazioni } from '@/hooks/useImpostazioni';
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
  const [kmTotali, setKmTotali] = useState('');
  const [incassoPrevisto, setIncassoPrevisto] = useState('');
  const [note, setNote] = useState('');

  const { mutate: conferma, isPending } = useConfermaPCar();
  const { users } = useAssignmentUsers(dataServizio, servizioId);
  const { veicoli } = useVeicoliAttivi();
  const { impostazioni } = useImpostazioni();

  const metodiPagamento = useMemo(() => {
    return (impostazioni?.metodi_pagamento || []).map(m => m.nome);
  }, [impostazioni]);

  const selectedUser = useMemo(() => {
    if (!assegnatoA) return null;
    return users.find(u => u.id === assegnatoA) || null;
  }, [assegnatoA, users]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disponibile': return 'text-green-600';
      case 'In servizio': return 'text-orange-500';
      case 'Turno assente': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const handleSubmit = () => {
    conferma(
      {
        servizio_id: servizioId,
        assegnato_a: assegnatoA || undefined,
        veicolo_id: veicoloId || undefined,
        metodo_pagamento: metodoPagamento || undefined,
        km_totali: kmTotali ? parseFloat(kmTotali) : undefined,
        incasso_previsto: incassoPrevisto ? parseFloat(incassoPrevisto) : undefined,
        note: note || undefined,
      },
      {
        onSuccess: () => {
          setAssegnatoA('');
          setVeicoloId('');
          setMetodoPagamento(metodoPagamentoIniziale || '');
          setKmTotali('');
          setIncassoPrevisto('');
          setNote('');
          onOpenChange(false);
          onSuccess?.();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>✅ Conferma Presa in Carico</DialogTitle>
          <DialogDescription>
            Compila i dettagli del servizio e conferma la presa in carico.
            Verrà inviata email di conferma al cliente con il percorso completo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Autista */}
          <div className="space-y-2">
            <Label>Autista (opzionale)</Label>
            <select
              value={assegnatoA}
              onChange={(e) => setAssegnatoA(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
          <div className="space-y-2">
            <Label>Veicolo (opzionale)</Label>
            <select
              value={veicoloId}
              onChange={(e) => setVeicoloId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">-- Seleziona veicolo --</option>
              {(veicoli || []).map((v) => (
                <option key={v.id} value={v.id}>
                  {v.modello} - {v.targa}
                </option>
              ))}
            </select>
          </div>

          {/* Metodo di Pagamento */}
          <div className="space-y-2">
            <Label>Metodo di Pagamento (opzionale)</Label>
            <select
              value={metodoPagamento}
              onChange={(e) => setMetodoPagamento(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">-- Seleziona metodo --</option>
              {metodiPagamento.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* KM Totali */}
          <div className="space-y-2">
            <Label>KM Totali (opzionale)</Label>
            <Input
              type="number"
              placeholder="es. 150"
              value={kmTotali}
              onChange={(e) => setKmTotali(e.target.value)}
            />
          </div>

          {/* Incasso Previsto */}
          <div className="space-y-2">
            <Label>Tariffa Prevista (opzionale)</Label>
            <Input
              type="number"
              placeholder="es. 250.00"
              value={incassoPrevisto}
              onChange={(e) => setIncassoPrevisto(e.target.value)}
            />
          </div>

          {/* Note */}
          <div className="space-y-2">
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
      </DialogContent>
    </Dialog>
  );
}
