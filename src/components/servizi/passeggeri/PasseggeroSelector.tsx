
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, User, UserPlus, Search, MapPin, Mail, Phone, ChevronRight, Info } from 'lucide-react';
import { usePasseggeri } from '@/hooks/usePasseggeri';
import { Passeggero, PasseggeroFormData } from '@/lib/types/servizi';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { MobileInput } from '@/components/ui/mobile-input';
import { MobileButton } from '@/components/ui/mobile-button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  
  // Dialog state per conferma aggiunta passeggero
  const [pendingPasseggero, setPendingPasseggero] = useState<Passeggero | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  const handleSelectExisting = (passeggero: Passeggero) => {
    console.log('[PasseggeroSelector] Opening dialog for:', passeggero.id);
    setPendingPasseggero(passeggero);
    setShowConfigDialog(true);
  };

  const handleConfirmAdd = (personalizzato: boolean) => {
    if (!pendingPasseggero) return;
    
    console.log('[PasseggeroSelector] Confirming add, personalizzato:', personalizzato);
    
    // Estrai nome e cognome se non presenti
    let nome = pendingPasseggero.nome;
    let cognome = pendingPasseggero.cognome;
    
    if (!nome || !cognome) {
      const nomeCognomeSplit = (pendingPasseggero.nome_cognome || '').trim().split(' ');
      if (nomeCognomeSplit.length >= 2) {
        nome = nome || nomeCognomeSplit[0];
        cognome = cognome || nomeCognomeSplit.slice(1).join(' ');
      } else if (nomeCognomeSplit.length === 1) {
        nome = nome || nomeCognomeSplit[0];
        cognome = cognome || '';
      }
    }

    const passeggeroData = {
      id: pendingPasseggero.id,
      passeggero_id: pendingPasseggero.id,
      nome_cognome: pendingPasseggero.nome_cognome || `${nome || ''} ${cognome || ''}`.trim(),
      nome: nome || '',
      cognome: cognome || '',
      localita: pendingPasseggero.localita || '',
      indirizzo: pendingPasseggero.indirizzo || '',
      email: pendingPasseggero.email || '',
      telefono: pendingPasseggero.telefono || '',
      usa_indirizzo_personalizzato: personalizzato,
      is_existing: true,
      salva_in_database: true,
    };
    
    console.log('[PasseggeroSelector] Final data:', passeggeroData);
    onPasseggeroSelect(passeggeroData);
    
    // Toast di conferma visivo
    toast.success(`✅ ${passeggeroData.nome_cognome} aggiunto`);
    
    setShowConfigDialog(false);
    setPendingPasseggero(null);
    setSearchTerm("");
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
        {/* PER PRIVATI: Selezione chiara "Chi è il passeggero?" */}
        {tipo_cliente === 'privato' && !showNewForm && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Chi è il passeggero?</p>
            
            {/* Messaggio informativo se dati cliente non compilati */}
            {(!clientePrivatoData?.nome || !clientePrivatoData?.cognome) && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950/30 dark:border-blue-800">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Compila i <span className="font-semibold">dati del cliente</span> nella 
                  sezione sopra per poterli importare automaticamente come passeggero
                </p>
              </div>
            )}
            
            {/* Opzione 1: Il cliente stesso (visibile solo se ha dati) */}
            {clientePrivatoData?.nome && clientePrivatoData?.cognome && (
              <Card 
                className="cursor-pointer hover:border-primary transition-colors border"
                onClick={handleSelectCliente}
              >
                <CardContent className="p-4 min-h-[56px]">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">Il cliente stesso</p>
                        <p className="text-sm text-primary font-medium mt-1">
                          {clientePrivatoData.nome} {clientePrivatoData.cognome}
                        </p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                          {clientePrivatoData.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[150px]">{clientePrivatoData.email}</span>
                            </span>
                          )}
                          {clientePrivatoData.telefono && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {clientePrivatoData.telefono}
                            </span>
                          )}
                        </div>
                        {(clientePrivatoData.indirizzo || clientePrivatoData.citta) && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">
                              {clientePrivatoData.indirizzo}
                              {clientePrivatoData.indirizzo && clientePrivatoData.citta && ', '}
                              {clientePrivatoData.citta}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Opzione 2: Un'altra persona */}
            <Card 
              className="cursor-pointer hover:border-primary transition-colors border"
              onClick={() => setShowNewForm(true)}
            >
              <CardContent className="p-4 min-h-[56px]">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Un'altra persona</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Aggiungi manualmente i dati del passeggero
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
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
                    className="flex items-start justify-between p-3 border rounded hover:bg-muted cursor-pointer transition-colors active:bg-muted"
                    onClick={() => handleSelectExisting(passeggero)}
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

        {/* Crea nuovo passeggero */}
        <div className={tipo_cliente === 'azienda' ? "border-t pt-4" : ""}>
          {/* Per AZIENDE: mostra pulsante quando form chiuso */}
          {tipo_cliente === 'azienda' && !showNewForm && (
            <Button
              type="button"
              variant="default"
              className="w-full gap-2 h-11"
              onClick={() => setShowNewForm(true)}
            >
              <UserPlus className="h-4 w-4" />
              Crea nuovo passeggero
            </Button>
          )}
          
          {/* Form nuovo passeggero (per entrambi i tipi quando showNewForm=true) */}
          {showNewForm && (
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
      
      {/* Dialog conferma aggiunta passeggero */}
      <AlertDialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Aggiungi passeggero
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div className="text-foreground font-medium">
                {pendingPasseggero?.nome_cognome}
              </div>
              {pendingPasseggero?.indirizzo && (
                <div className="text-sm">
                  📍 {pendingPasseggero.indirizzo}{pendingPasseggero.localita && `, ${pendingPasseggero.localita}`}
                </div>
              )}
              <p>Vuoi personalizzare indirizzo o orario di presa?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel 
              onClick={() => {
                setShowConfigDialog(false);
                setPendingPasseggero(null);
              }}
              className="w-full sm:w-auto min-h-[44px]"
            >
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleConfirmAdd(false)}
              className="w-full sm:w-auto min-h-[44px]"
            >
              Usa dati servizio
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => handleConfirmAdd(true)}
              className="w-full sm:w-auto min-h-[44px] bg-primary"
            >
              Personalizza
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
