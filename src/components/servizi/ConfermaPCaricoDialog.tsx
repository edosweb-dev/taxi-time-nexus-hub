import { useState } from 'react';
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
import { useUsers } from '@/hooks/useUsers';

interface ConfermaPCaricoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servizioId: string;
  onSuccess?: () => void;
}

export function ConfermaPCaricoDialog({
  open,
  onOpenChange,
  servizioId,
  onSuccess,
}: ConfermaPCaricoDialogProps) {
  const [assegnatoA, setAssegnatoA] = useState('');
  const [veicoloId, setVeicoloId] = useState('');
  const [kmTotali, setKmTotali] = useState('');
  const [incassoPrevisto, setIncassoPrevisto] = useState('');
  const [note, setNote] = useState('');

  const { mutate: conferma, isPending } = useConfermaPCar();
  const { users } = useUsers();
  const { veicoli } = useVeicoliAttivi();

  // Filter to employees only (admin, socio, dipendente)
  const autisti = (users || []).filter(
    (u) => u.role === 'admin' || u.role === 'socio' || u.role === 'dipendente'
  );

  const handleSubmit = () => {
    conferma(
      {
        servizio_id: servizioId,
        assegnato_a: assegnatoA || undefined,
        veicolo_id: veicoloId || undefined,
        km_totali: kmTotali ? parseFloat(kmTotali) : undefined,
        incasso_previsto: incassoPrevisto ? parseFloat(incassoPrevisto) : undefined,
        note: note || undefined,
      },
      {
        onSuccess: () => {
          // Reset form
          setAssegnatoA('');
          setVeicoloId('');
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
              {autisti.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                </option>
              ))}
            </select>
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
