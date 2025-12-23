import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';
import { useCreateTariffa } from '@/hooks/useConfigurazioneStipendi';

interface NuovaTariffaDialogProps {
  anno: number;
}

export function NuovaTariffaDialog({ anno }: NuovaTariffaDialogProps) {
  const [open, setOpen] = useState(false);
  const [km, setKm] = useState('');
  const [importo, setImporto] = useState('');

  const createMutation = useCreateTariffa();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const kmValue = parseInt(km);
    const importoValue = parseFloat(importo);
    
    if (isNaN(kmValue) || kmValue < 1) return;
    if (isNaN(importoValue) || importoValue <= 0) return;

    await createMutation.mutateAsync({
      anno,
      km: kmValue,
      importo_base: importoValue
    });

    setKm('');
    setImporto('');
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setKm('');
      setImporto('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Nuova Tariffa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nuova Tariffa KM</DialogTitle>
            <DialogDescription>
              Inserisci una tariffa personalizzata per l'anno {anno}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="km">Chilometri</Label>
              <Input
                id="km"
                type="number"
                placeholder="es. 25"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                min="1"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="importo">Importo Base (€)</Label>
              <Input
                id="importo"
                type="number"
                step="0.01"
                placeholder="es. 22.50"
                value={importo}
                onChange={(e) => setImporto(e.target.value)}
                min="0.01"
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                'Salva Tariffa'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
