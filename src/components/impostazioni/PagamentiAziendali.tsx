
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { useModalitaPagamenti } from '@/hooks/useModalitaPagamenti';

export function PagamentiAziendali() {
  const [nuovaModalita, setNuovaModalita] = useState('');
  const [showForm, setShowForm] = useState(false);
  const { modalita, addModalita, toggleModalita } = useModalitaPagamenti();

  const handleAddModalita = async () => {
    if (nuovaModalita.trim()) {
      await addModalita.mutateAsync(nuovaModalita.trim());
      setNuovaModalita('');
      setShowForm(false);
    }
  };

  const handleToggleAttivo = async (id: string, attivo: boolean) => {
    await toggleModalita.mutateAsync({ id, attivo });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Modalità di Pagamento</h3>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Nome modalità di pagamento..."
                value={nuovaModalita}
                onChange={(e) => setNuovaModalita(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddModalita()}
              />
              <Button onClick={handleAddModalita} disabled={addModalita.isPending}>
                Salva
              </Button>
              <Button variant="outline" onClick={() => {
                setShowForm(false);
                setNuovaModalita('');
              }}>
                Annulla
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {modalita
          .sort((a, b) => a.nome.localeCompare(b.nome))
          .map((modalita) => (
            <Card key={modalita.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">{modalita.nome}</span>
                    {modalita.attivo ? (
                      <Badge variant="default" className="bg-green-600">Attivo</Badge>
                    ) : (
                      <Badge variant="secondary">Non attivo</Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={modalita.attivo}
                      onCheckedChange={(checked) => handleToggleAttivo(modalita.id, checked)}
                      disabled={toggleModalita.isPending}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled
                      className="text-muted-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {modalita.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          <p>Nessuna modalità di pagamento configurata</p>
        </div>
      )}
    </div>
  );
}
