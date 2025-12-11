
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, User, UserPlus, Search, MapPin, Mail, Phone } from 'lucide-react';
import { usePasseggeri } from '@/hooks/usePasseggeri';
import { Passeggero, PasseggeroFormData } from '@/lib/types/servizi';
import { Skeleton } from '@/components/ui/skeleton';
import { MobileInput } from '@/components/ui/mobile-input';
import { MobileButton } from '@/components/ui/mobile-button';

interface PasseggeroSelectorProps {
  azienda_id?: string;
  tipo_cliente?: 'azienda' | 'privato';
  onPasseggeroSelect: (passeggero: PasseggeroFormData) => void;
  clientePrivatoData?: {
    nome: string;
    cognome: string;
    email?: string;
    telefono?: string;
    indirizzo?: string;
    citta?: string;
  };
}

export function PasseggeroSelector({ azienda_id, tipo_cliente = 'azienda', onPasseggeroSelect, clientePrivatoData }: PasseggeroSelectorProps) {
  const { data: { passeggeri = [], isLoading = false } = {} } = usePasseggeri(azienda_id);
  const [showNewForm, setShowNewForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [salvaInRubrica, setSalvaInRubrica] = useState(true);
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
      salva_in_database: true,
    };
    
    // ✅ DEBUG LOG
    console.log('═══════════════════════════════════');
    console.log('🔍 [PasseggeroSelector] handleSelectExisting FINAL DATA:');
    console.log('usa_indirizzo_personalizzato:', passeggeroData.usa_indirizzo_personalizzato);
    console.log('typeof usa_indirizzo_personalizzato:', typeof passeggeroData.usa_indirizzo_personalizzato);
    console.log('salva_in_database:', passeggeroData.salva_in_database);
    console.log('Full object:', JSON.stringify(passeggeroData, null, 2));
    console.log('═══════════════════════════════════');
    
    onPasseggeroSelect(passeggeroData);
  };

  const handleCreateNew = () => {
    console.log('[PasseggeroSelector] handleCreateNew called');
    console.log('[PasseggeroSelector] newPasseggero:', newPasseggero);
    console.log('[PasseggeroSelector] salvaInRubrica:', salvaInRubrica);
    
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
      salva_in_database: tipo_cliente === 'azienda' ? salvaInRubrica : false,
    };
    
    // ✅ DEBUG LOG
    console.log('═══════════════════════════════════');
    console.log('🔍 [PasseggeroSelector] handleCreateNew FINAL DATA:');
    console.log('usa_indirizzo_personalizzato:', passeggeroData.usa_indirizzo_personalizzato);
    console.log('typeof usa_indirizzo_personalizzato:', typeof passeggeroData.usa_indirizzo_personalizzato);
    console.log('salva_in_database:', passeggeroData.salva_in_database);
    console.log('Full object:', JSON.stringify(passeggeroData, null, 2));
    console.log('═══════════════════════════════════');
    
    onPasseggeroSelect(passeggeroData);

    setNewPasseggero({ nome: '', cognome: '', localita: '', indirizzo: '', email: '', telefono: '' });
    setSalvaInRubrica(true);
    setShowNewForm(false);
  };

  const handleSelectCliente = () => {
    if (!clientePrivatoData) return;
    
    const passeggeroData = {
      nome_cognome: `${clientePrivatoData.nome} ${clientePrivatoData.cognome}`.trim(),
      nome: clientePrivatoData.nome,
      cognome: clientePrivatoData.cognome,
      email: clientePrivatoData.email || '',
      telefono: clientePrivatoData.telefono || '',
      indirizzo: clientePrivatoData.indirizzo || '',
      localita: clientePrivatoData.citta || '',
      usa_indirizzo_personalizzato: false,
      is_existing: false,
      salva_in_database: false,
      is_cliente_import: true,
    };
    
    onPasseggeroSelect(passeggeroData);
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

  if (!azienda_id && tipo_cliente === 'azienda') {
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

  // Per privati, non serve azienda_id

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserPlus className="h-5 w-5" />
          Aggiungi passeggeri
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Card Cliente del Servizio - Solo per privati */}
        {tipo_cliente === 'privato' && clientePrivatoData && clientePrivatoData.nome && clientePrivatoData.cognome && (
          <div className="mb-4">
            <Card className="border border-border/50">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Header e informazioni */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs font-medium text-muted-foreground">Cliente del servizio</span>
                    </div>
                    
                    <h5 className="font-semibold text-base mb-3 text-foreground">
                      {clientePrivatoData.nome} {clientePrivatoData.cognome}
                    </h5>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {clientePrivatoData.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{clientePrivatoData.email}</span>
                        </div>
                      )}
                      {clientePrivatoData.telefono && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>{clientePrivatoData.telefono}</span>
                        </div>
                      )}
                      {(clientePrivatoData.indirizzo || clientePrivatoData.citta) && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">
                            {clientePrivatoData.indirizzo}{clientePrivatoData.indirizzo && clientePrivatoData.citta && ', '}{clientePrivatoData.citta}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* CTA */}
                  <Button 
                    size="default"
                    onClick={handleSelectCliente}
                    className="w-full gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Aggiungi
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Ricerca passeggeri esistenti - Solo per aziende */}
        {tipo_cliente === 'azienda' && (
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Passeggeri esistenti
          </Label>
          {passeggeri.length > 0 && (
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <MobileInput
                placeholder="Cerca per nome, email, località..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11"
              />
            </div>
          )}
          
          {!searchTerm ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              {passeggeri.length === 0 ? 
                "Nessun passeggero trovato per questa azienda" :
                "Inizia a digitare per cercare un passeggero esistente"
              }
            </div>
          ) : isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredPasseggeri.length > 0 ? (
            <div className="max-h-64 overflow-y-auto space-y-2 overscroll-contain touch-pan-y">
              {filteredPasseggeri.map((passeggero) => {
                const nomeCompleto = passeggero.nome_cognome || `${passeggero.nome || ''} ${passeggero.cognome || ''}`.trim();
                return (
                  <div
                    key={passeggero.id}
                    className="flex items-start justify-between p-3 border rounded hover:bg-muted cursor-pointer transition-colors touch-manipulation select-none active:bg-muted"
                    onClick={() => handleSelectExisting(passeggero)}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      handleSelectExisting(passeggero);
                    }}
                    role="button"
                    tabIndex={0}
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
        )}
        
        {/* Per privati: messaggio informativo */}
        {tipo_cliente === 'privato' && (
          <div className="text-center py-3 text-muted-foreground text-sm bg-blue-50 border border-blue-200 rounded-lg">
            Per clienti privati, crea passeggeri manualmente usando il form sottostante
          </div>
        )}

        {/* Crea nuovo passeggero */}
        <div className="border-t pt-4">
          {!showNewForm ? (
            <Button
              type="button"
              variant="default"
              className="w-full gap-2 h-11"
              onClick={() => setShowNewForm(true)}
            >
              <UserPlus className="h-4 w-4" />
              Crea nuovo passeggero
            </Button>
          ) : (
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Nuovo passeggero
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
              {tipo_cliente === 'azienda' && (
              <div className="flex items-center space-x-2 pt-2 pb-2">
                <Checkbox 
                  id="salva-rubrica" 
                  checked={salvaInRubrica}
                  onCheckedChange={(checked) => setSalvaInRubrica(checked === true)}
                />
                <Label 
                  htmlFor="salva-rubrica" 
                  className="text-sm font-normal cursor-pointer"
                >
                  Salva passeggero in rubrica
                </Label>
              </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <MobileButton
                  type="button"
                  variant="default"
                  onClick={handleCreateNew}
                  disabled={!newPasseggero.nome.trim() || !newPasseggero.cognome.trim()}
                  fluid
                  className="sm:flex-1 text-white"
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
