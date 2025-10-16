import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Profile } from '@/lib/types';
import { Passeggero } from '@/lib/api/passeggeri';

interface PasseggeroDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PasseggeroFormData) => Promise<void>;
  passeggero?: Passeggero | null;
  referenti: Profile[];
  isSubmitting?: boolean;
}

export interface PasseggeroFormData {
  nome_cognome: string;
  nome?: string;
  cognome?: string;
  email?: string;
  telefono?: string;
  localita?: string;
  indirizzo?: string;
  referente_id?: string | null;
}

export function PasseggeroDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  passeggero,
  referenti,
  isSubmitting = false
}: PasseggeroDialogProps) {
  const [formData, setFormData] = useState<PasseggeroFormData>({
    nome_cognome: '',
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    localita: '',
    indirizzo: '',
    referente_id: null
  });

  useEffect(() => {
    if (passeggero) {
      setFormData({
        nome_cognome: passeggero.nome_cognome || '',
        nome: passeggero.nome || '',
        cognome: passeggero.cognome || '',
        email: passeggero.email || '',
        telefono: passeggero.telefono || '',
        localita: passeggero.localita || '',
        indirizzo: passeggero.indirizzo || '',
        referente_id: passeggero.referente_id || null
      });
    } else {
      setFormData({
        nome_cognome: '',
        nome: '',
        cognome: '',
        email: '',
        telefono: '',
        localita: '',
        indirizzo: '',
        referente_id: null
      });
    }
  }, [passeggero, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {passeggero ? 'Modifica Passeggero' : 'Nuovo Passeggero'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome_cognome">Nome e Cognome *</Label>
            <Input
              id="nome_cognome"
              value={formData.nome_cognome}
              onChange={(e) => setFormData({ ...formData, nome_cognome: e.target.value })}
              placeholder="Mario Rossi"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Mario"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cognome">Cognome</Label>
              <Input
                id="cognome"
                value={formData.cognome}
                onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
                placeholder="Rossi"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referente">Referente</Label>
            <Select
              value={formData.referente_id || 'none'}
              onValueChange={(value) => 
                setFormData({ ...formData, referente_id: value === 'none' ? null : value })
              }
            >
              <SelectTrigger id="referente">
                <SelectValue placeholder="Seleziona un referente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nessun referente</SelectItem>
                {referenti.map((ref) => (
                  <SelectItem key={ref.id} value={ref.id}>
                    {ref.first_name} {ref.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="mario.rossi@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Telefono</Label>
            <Input
              id="telefono"
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              placeholder="+39 333 1234567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="localita">Località</Label>
            <Input
              id="localita"
              value={formData.localita}
              onChange={(e) => setFormData({ ...formData, localita: e.target.value })}
              placeholder="Milano"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="indirizzo">Indirizzo</Label>
            <Input
              id="indirizzo"
              value={formData.indirizzo}
              onChange={(e) => setFormData({ ...formData, indirizzo: e.target.value })}
              placeholder="Via Roma 123"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.nome_cognome}>
              {isSubmitting ? 'Salvataggio...' : passeggero ? 'Salva' : 'Crea'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
