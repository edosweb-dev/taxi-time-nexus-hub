
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, User, UserPlus, Search, MapPin, Mail, Phone } from 'lucide-react';
import { usePasseggeri } from '@/hooks/usePasseggeri';
import { Passeggero, PasseggeroFormData } from '@/lib/types/servizi';
import { Skeleton } from '@/components/ui/skeleton';
import { MobileInput } from '@/components/ui/mobile-input';
import { MobileButton } from '@/components/ui/mobile-button';

interface PasseggeroSelectorProps {
  azienda_id?: string;
  referente_id?: string;
  onPasseggeroSelect: (passeggero: PasseggeroFormData) => void;
}

export function PasseggeroSelector({ azienda_id, referente_id, onPasseggeroSelect }: PasseggeroSelectorProps) {
  const { data: { passeggeri = [], isLoading = false } = {} } = usePasseggeri(azienda_id, referente_id);
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
    console.log('[PasseggeroSelector] Selecting existing passenger:', passeggero);
    
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

    const passeggeroData = {
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
    };
    
    console.log('[PasseggeroSelector] Calling onPasseggeroSelect with:', passeggeroData);
    onPasseggeroSelect(passeggeroData);
  };

  const handleCreateNew = () => {
    console.log('[PasseggeroSelector] handleCreateNew called');
    console.log('[PasseggeroSelector] newPasseggero:', newPasseggero);
    
    if (!newPasseggero.nome.trim() || !newPasseggero.cognome.trim()) {
      console.log('[PasseggeroSelector] Nome or cognome is empty, aborting');
      return;
    }

    const passeggeroData = {
      nome_cognome: `${newPasseggero.nome} ${newPasseggero.cognome}`,
      nome: newPasseggero.nome,
      cognome: newPasseggero.cognome,
      localita: newPasseggero.localita,
      indirizzo: newPasseggero.indirizzo,
      email: newPasseggero.email,
      telefono: newPasseggero.telefono,
      usa_indirizzo_personalizzato: false,
      is_existing: false,
    };
    
    console.log('[PasseggeroSelector] Calling onPasseggeroSelect with new passenger:', passeggeroData);
    onPasseggeroSelect(passeggeroData);

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

  if (!azienda_id) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <User className="h-8 w-8 text-muted-foreground" />
            <p>Seleziona prima un'azienda per gestire i passeggeri</p>
          </div>
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
          {!referente_id && (
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
              Senza referente
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ricerca passeggeri esistenti */}
        <div>
          <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
            Passeggeri esistenti
            {!referente_id && (
              <span className="text-xs text-amber-600">
                (dell'azienda)
              </span>
            )}
          </Label>
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
              {passeggeri.length === 0 ? (
                referente_id ? 
                  "Nessun passeggero trovato per questo referente" :
                  "Nessun passeggero trovato per questa azienda"
              ) : (
                "Inizia a digitare per cercare un passeggero esistente"
              )}
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
            <MobileButton
              type="button"
              variant="outline"
              fluid
              onClick={() => setShowNewForm(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Crea nuovo passeggero
            </MobileButton>
          ) : (
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                Nuovo passeggero
                {!referente_id && (
                  <span className="text-xs text-amber-600">
                    (sarà collegato all'azienda)
                  </span>
                )}
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="nome-nuovo" className="text-xs text-muted-foreground mb-1 block">Nome *</Label>
                  <MobileInput
                    id="nome-nuovo"
                    placeholder="Inserisci nome"
                    value={newPasseggero.nome}
                    onChange={(e) => setNewPasseggero(prev => ({ ...prev, nome: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="cognome-nuovo" className="text-xs text-muted-foreground mb-1 block">Cognome *</Label>
                  <MobileInput
                    id="cognome-nuovo"
                    placeholder="Inserisci cognome"
                    value={newPasseggero.cognome}
                    onChange={(e) => setNewPasseggero(prev => ({ ...prev, cognome: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="localita-nuovo" className="text-xs text-muted-foreground mb-1 block">Località</Label>
                  <MobileInput
                    id="localita-nuovo"
                    placeholder="Inserisci località"
                    value={newPasseggero.localita}
                    onChange={(e) => setNewPasseggero(prev => ({ ...prev, localita: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="indirizzo-nuovo" className="text-xs text-muted-foreground mb-1 block">Indirizzo</Label>
                  <MobileInput
                    id="indirizzo-nuovo"
                    placeholder="Inserisci indirizzo"
                    value={newPasseggero.indirizzo}
                    onChange={(e) => setNewPasseggero(prev => ({ ...prev, indirizzo: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email-nuovo" className="text-xs text-muted-foreground mb-1 block">Email</Label>
                  <MobileInput
                    id="email-nuovo"
                    placeholder="email@azienda.com"
                    type="email"
                    value={newPasseggero.email}
                    onChange={(e) => setNewPasseggero(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="telefono-nuovo" className="text-xs text-muted-foreground mb-1 block">Telefono</Label>
                  <MobileInput
                    id="telefono-nuovo"
                    placeholder="+39 123 456 7890"
                    type="tel"
                    value={newPasseggero.telefono}
                    onChange={(e) => setNewPasseggero(prev => ({ ...prev, telefono: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <MobileButton
                  type="button"
                  variant="default"
                  onClick={handleCreateNew}
                  disabled={!newPasseggero.nome.trim() || !newPasseggero.cognome.trim()}
                  fluid
                  className="sm:flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Passeggero
                </MobileButton>
                <MobileButton
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewForm(false)}
                  fluid
                  className="sm:flex-1"
                >
                  Annulla
                </MobileButton>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
