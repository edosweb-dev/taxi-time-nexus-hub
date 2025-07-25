
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, User, UserPlus, Search, MapPin, Mail, Phone } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [newPasseggero, setNewPasseggero] = useState({
    nome: '',
    cognome: '',
    localita: '',
    indirizzo: '',
    email: '',
    telefono: '',
  });

  const handleSelectExisting = (passeggero: Passeggero) => {
    // Se nome e cognome sono null, li estraiamo da nome_cognome
    let nome = passeggero.nome;
    let cognome = passeggero.cognome;
    
    if (!nome || !cognome) {
      const nomeCognomeSplit = (passeggero.nome_cognome || '').trim().split(' ');
      if (nomeCognomeSplit.length >= 2) {
        nome = nome || nomeCognomeSplit[0];
        cognome = cognome || nomeCognomeSplit.slice(1).join(' ');
      } else if (nomeCognomeSplit.length === 1) {
        nome = nome || nomeCognomeSplit[0];
        cognome = cognome || '';
      }
    }

    onPasseggeroSelect({
      id: passeggero.id,
      passeggero_id: passeggero.id,
      nome_cognome: passeggero.nome_cognome || `${nome || ''} ${cognome || ''}`.trim(),
      nome: nome || '',
      cognome: cognome || '',
      localita: passeggero.localita || '',
      indirizzo: passeggero.indirizzo || '',
      email: passeggero.email || '',
      telefono: passeggero.telefono || '',
      usa_indirizzo_personalizzato: false,
      is_existing: true,
    });
  };

  const handleCreateNew = () => {
    if (!newPasseggero.nome.trim() || !newPasseggero.cognome.trim()) return;

    onPasseggeroSelect({
      nome_cognome: `${newPasseggero.nome} ${newPasseggero.cognome}`,
      nome: newPasseggero.nome,
      cognome: newPasseggero.cognome,
      localita: newPasseggero.localita,
      indirizzo: newPasseggero.indirizzo,
      email: newPasseggero.email,
      telefono: newPasseggero.telefono,
      usa_indirizzo_personalizzato: false,
      is_existing: false,
    });

    setNewPasseggero({ nome: '', cognome: '', localita: '', indirizzo: '', email: '', telefono: '' });
    setShowNewForm(false);
  };

  // Filtra i passeggeri in base al termine di ricerca
  const filteredPasseggeri = passeggeri.filter(passeggero => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const nomeCompleto = passeggero.nome_cognome || `${passeggero.nome || ''} ${passeggero.cognome || ''}`.trim();
    return nomeCompleto.toLowerCase().includes(searchLower) ||
           (passeggero.email && passeggero.email.toLowerCase().includes(searchLower)) ||
           (passeggero.localita && passeggero.localita.toLowerCase().includes(searchLower)) ||
           (passeggero.indirizzo && passeggero.indirizzo.toLowerCase().includes(searchLower));
  });

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
        {/* Ricerca passeggeri esistenti */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Passeggeri esistenti</Label>
          {passeggeri.length > 0 && (
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca per nome, email, località..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
          
          {!searchTerm ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Inizia a digitare per cercare un passeggero esistente
            </div>
          ) : isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredPasseggeri.length > 0 ? (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredPasseggeri.map((passeggero) => {
                const nomeCompleto = passeggero.nome_cognome || `${passeggero.nome || ''} ${passeggero.cognome || ''}`.trim();
                return (
                  <div
                    key={passeggero.id}
                    className="flex items-start justify-between p-3 border rounded hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => handleSelectExisting(passeggero)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{nomeCompleto}</div>
                      <div className="space-y-1 mt-1">
                        {passeggero.email && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{passeggero.email}</span>
                          </div>
                        )}
                        {passeggero.telefono && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{passeggero.telefono}</span>
                          </div>
                        )}
                        {(passeggero.localita || passeggero.indirizzo) && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">
                              {[passeggero.localita, passeggero.indirizzo].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Plus className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Nessun passeggero trovato con i criteri di ricerca
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
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Nome *"
                    value={newPasseggero.nome}
                    onChange={(e) => setNewPasseggero(prev => ({ ...prev, nome: e.target.value }))}
                  />
                  <Input
                    placeholder="Cognome *"
                    value={newPasseggero.cognome}
                    onChange={(e) => setNewPasseggero(prev => ({ ...prev, cognome: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Località"
                    value={newPasseggero.localita}
                    onChange={(e) => setNewPasseggero(prev => ({ ...prev, localita: e.target.value }))}
                  />
                  <Input
                    placeholder="Indirizzo"
                    value={newPasseggero.indirizzo}
                    onChange={(e) => setNewPasseggero(prev => ({ ...prev, indirizzo: e.target.value }))}
                  />
                </div>
                <Input
                  placeholder="Email aziendale"
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
                  disabled={!newPasseggero.nome.trim() || !newPasseggero.cognome.trim()}
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
