
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, User, UserPlus } from 'lucide-react';
import { usePasseggeri } from '@/hooks/usePasseggeri';
import { Passeggero, PasseggeroFormData } from '@/lib/types/servizi';
import { Skeleton } from '@/components/ui/skeleton';

interface PasseggeroSelectorProps {
  azienda_id?: string;
  referente_id?: string;
  onPasseggeroSelect: (passeggero: PasseggeroFormData) => void;
}

export function PasseggeroSelector({ azienda_id, referente_id, onPasseggeroSelect }: PasseggeroSelectorProps) {
  const { passeggeri, isLoading } = usePasseggeri(azienda_id, referente_id);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newPasseggero, setNewPasseggero] = useState({
    nome_cognome: '',
    email: '',
    telefono: '',
  });

  const handleSelectExisting = (passeggero: Passeggero) => {
    onPasseggeroSelect({
      id: passeggero.id,
      passeggero_id: passeggero.id,
      nome_cognome: passeggero.nome_cognome,
      email: passeggero.email || '',
      telefono: passeggero.telefono || '',
      usa_indirizzo_personalizzato: false,
      is_existing: true,
    });
  };

  const handleCreateNew = () => {
    if (!newPasseggero.nome_cognome.trim()) return;

    onPasseggeroSelect({
      nome_cognome: newPasseggero.nome_cognome,
      email: newPasseggero.email,
      telefono: newPasseggero.telefono,
      usa_indirizzo_personalizzato: false,
      is_existing: false,
    });

    setNewPasseggero({ nome_cognome: '', email: '', telefono: '' });
    setShowNewForm(false);
  };

  if (!azienda_id || !referente_id) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          Seleziona prima un'azienda e un referente per gestire i passeggeri
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Aggiungi Passeggero
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Passeggeri esistenti */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Passeggeri esistenti</Label>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : passeggeri.length > 0 ? (
            <div className="max-h-32 overflow-y-auto space-y-2">
              {passeggeri.map((passeggero) => (
                <div
                  key={passeggero.id}
                  className="flex items-center justify-between p-2 border rounded hover:bg-muted cursor-pointer"
                  onClick={() => handleSelectExisting(passeggero)}
                >
                  <div>
                    <div className="font-medium">{passeggero.nome_cognome}</div>
                    {passeggero.email && (
                      <div className="text-sm text-muted-foreground">{passeggero.email}</div>
                    )}
                  </div>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Nessun passeggero trovato per questo referente
            </div>
          )}
        </div>

        {/* Crea nuovo passeggero */}
        <div className="border-t pt-4">
          {!showNewForm ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowNewForm(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Crea nuovo passeggero
            </Button>
          ) : (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Nuovo passeggero</Label>
              <div className="space-y-2">
                <Input
                  placeholder="Nome e cognome *"
                  value={newPasseggero.nome_cognome}
                  onChange={(e) => setNewPasseggero(prev => ({ ...prev, nome_cognome: e.target.value }))}
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={newPasseggero.email}
                  onChange={(e) => setNewPasseggero(prev => ({ ...prev, email: e.target.value }))}
                />
                <Input
                  placeholder="Telefono"
                  value={newPasseggero.telefono}
                  onChange={(e) => setNewPasseggero(prev => ({ ...prev, telefono: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreateNew}
                  disabled={!newPasseggero.nome_cognome.trim()}
                >
                  Aggiungi
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowNewForm(false)}
                >
                  Annulla
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
