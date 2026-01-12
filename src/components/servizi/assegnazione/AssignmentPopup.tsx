import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Check } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Servizio, StatoServizio } from '@/lib/types/servizi';
import { useAssignmentUsers } from '@/hooks/useAssignmentUsers';
import { ConducenteEsternoSelect } from './ConducenteEsternoSelect';
import { useVeicoliAttivi } from '@/hooks/useVeicoli';
import { sendNotification } from '@/hooks/useSendNotification';

/**
 * Verifica se un servizio ha un percorso valido definito
 */
function hasValidRoute(servizio: Servizio): boolean {
  const presa = servizio.indirizzo_presa?.trim().toLowerCase() || '';
  const destinazione = servizio.indirizzo_destinazione?.trim().toLowerCase() || '';
  
  // Controlla che entrambi gli indirizzi siano definiti e non siano placeholder
  const isPresaValid = presa && 
    presa !== 'da definire' && 
    presa !== 'da_definire' &&
    presa.length > 3;
  
  const isDestinazioneValid = destinazione && 
    destinazione !== 'da definire' && 
    destinazione !== 'da_definire' &&
    destinazione.length > 3;
  
  return isPresaValid && isDestinazioneValid;
}

interface AssignmentPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  servizio: Servizio;
}

export function AssignmentPopup({ 
  open, 
  onOpenChange, 
  onClose, 
  servizio 
}: AssignmentPopupProps) {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tipoConducente, setTipoConducente] = useState<'dipendente' | 'esterno'>('dipendente');
  const [selectedConducenteEsternoId, setSelectedConducenteEsternoId] = useState('');
  const [selectedDipendente, setSelectedDipendente] = useState<string>('');
  const [selectedVeicolo, setSelectedVeicolo] = useState<string>('');
  
  const { 
    users, 
    availableUsers, 
    unavailableUsers, 
    isLoading, 
    error,
    hasShiftsConfigured 
  } = useAssignmentUsers(servizio.data_servizio, servizio.id);
  
  const { veicoli: veicoliAttivi } = useVeicoliAttivi();
  
  // Verifica se il percorso è valido
  const hasRoute = hasValidRoute(servizio);
  
  console.log('[AssignmentPopup] Popup opened for service:', {
    id: servizio.id,
    data_servizio: servizio.data_servizio,
    stato: servizio.stato,
    availableCount: availableUsers.length,
    unavailableCount: unavailableUsers.length,
    hasShiftsConfigured,
    hasRoute,
    indirizzo_presa: servizio.indirizzo_presa,
    indirizzo_destinazione: servizio.indirizzo_destinazione
  });

  // Reset form when popup opens
  useEffect(() => {
    if (open) {
      setTipoConducente(servizio.conducente_esterno ? 'esterno' : 'dipendente');
      setSelectedConducenteEsternoId(servizio.conducente_esterno_id || '');
      setSelectedDipendente(servizio.assegnato_a || '');
      setSelectedVeicolo(servizio.veicolo_id || '');
      console.log('[AssignmentPopup] Form reset with existing values:', {
        tipoConducente: servizio.conducente_esterno ? 'esterno' : 'dipendente',
        conducenteEsternoId: servizio.conducente_esterno_id,
        assegnatoA: servizio.assegnato_a,
        veicoloId: servizio.veicolo_id
      });
    }
  }, [open, servizio]);

  // Handle error state
  useEffect(() => {
    if (error) {
      console.error('[AssignmentPopup] Error loading users:', error);
      toast.error('Errore nel caricamento degli utenti disponibili');
    }
  }, [error]);

  const handleAssign = async () => {
    try {
      setIsSubmitting(true);
      console.log('[AssignmentPopup] Starting assignment process');
      
      const isConducenteEsterno = tipoConducente === 'esterno';
      
      let updateData: {
        stato: StatoServizio;
        assegnato_a?: string | null;
        veicolo_id?: string | null;
        conducente_esterno?: boolean;
        conducente_esterno_id?: string | null;
        conducente_esterno_nome?: string | null;
        conducente_esterno_email?: string | null;
      } = {
        stato: 'assegnato',
        veicolo_id: selectedVeicolo || null
      };
      
      if (isConducenteEsterno) {
        updateData = {
          ...updateData,
          conducente_esterno: true,
          conducente_esterno_id: selectedConducenteEsternoId,
          conducente_esterno_nome: null,
          conducente_esterno_email: null,
          assegnato_a: null
        };
        console.log('[AssignmentPopup] Assigning to external driver ID:', selectedConducenteEsternoId);
      } else {
        updateData = {
          ...updateData,
          conducente_esterno: false,
          conducente_esterno_id: null,
          conducente_esterno_nome: null,
          conducente_esterno_email: null,
          assegnato_a: selectedDipendente
        };
        console.log('[AssignmentPopup] Assigning to employee:', selectedDipendente);
      }
      
      // FIX: Aggiungi .select() per verificare l'update e logging
      const { data: updatedServizio, error } = await supabase
        .from('servizi')
        .update(updateData)
        .eq('id', servizio.id)
        .select('id, stato, assegnato_a, conducente_esterno_id')
        .single();
      
      if (error) {
        console.error('[AssignmentPopup] Errore update:', error);
        throw error;
      }
      
      console.log('[AssignmentPopup] Servizio aggiornato:', updatedServizio);
      
      // Verifica che lo stato sia cambiato
      if (updatedServizio?.stato !== 'assegnato') {
        console.warn('[AssignmentPopup] ATTENZIONE: stato non aggiornato a "assegnato":', updatedServizio);
      }
      
      toast.success('Servizio assegnato con successo');
      
      // Invia notifica email ai destinatari configurati
      if (servizio?.id) {
        console.log('[AssignmentPopup] Invio notifica email per servizio:', servizio.id);
        sendNotification(servizio.id, 'assegnato');
      }
      
      // Invalida tutte le query correlate per assicurare refresh UI
      await queryClient.invalidateQueries({ queryKey: ['servizi'] });
      await queryClient.invalidateQueries({ queryKey: ['servizio', servizio.id] });
      await queryClient.invalidateQueries({ queryKey: ['assigned-users'] });
      
      onClose();
    } catch (error: any) {
      console.error('[AssignmentPopup] Error assigning service:', error);
      toast.error(`Errore nell'assegnazione del servizio: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isConducenteEsterno = tipoConducente === 'esterno';
  const isAssignDisabled = isSubmitting || 
    !hasRoute ||
    (isConducenteEsterno ? !selectedConducenteEsternoId : !selectedDipendente);

  const content = (
    <>
      {/* Main Content Area */}
      <div className="space-y-6 animate-fade-in">
        
        {/* Driver Type Selection - Tabs */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Tipo di conducente</Label>
          <Tabs value={tipoConducente} onValueChange={(v) => setTipoConducente(v as 'dipendente' | 'esterno')} className="w-full">
            <TabsList className={`w-full grid grid-cols-2 ${isMobile ? 'h-11' : 'h-10'}`}>
              <TabsTrigger value="dipendente" className="text-sm">Dipendente</TabsTrigger>
              <TabsTrigger value="esterno" className="text-sm">Esterno</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Alert se percorso non definito */}
        {!hasRoute && (
          <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800 animate-fade-in">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200 text-sm">
              <span className="font-semibold">Percorso non definito.</span>
              <br />
              Prima di assegnare il servizio, è necessario specificare gli indirizzi di presa e destinazione.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Selection Area */}
        <div className="space-y-3">
          {isConducenteEsterno ? (
            <div className="space-y-3 animate-scale-in">
              <Label htmlFor="conducente-ext" className="text-sm font-semibold">
                Conducente Esterno <span className="text-red-500">*</span>
              </Label>
              <ConducenteEsternoSelect
                selectedConducenteId={selectedConducenteEsternoId}
                setSelectedConducenteId={setSelectedConducenteEsternoId}
              />
            </div>
          ) : (
            <div className="space-y-3 animate-scale-in">
              <Label htmlFor="dipendente" className="text-sm font-semibold">
                Dipendente <span className="text-red-500">*</span>
              </Label>
              
              {/* Alert for no available users */}
              {!isLoading && availableUsers.length === 0 && (
                <Alert className="border-amber-200 bg-amber-50/80 py-1.5 animate-fade-in">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                  <AlertDescription className="text-amber-800 text-xs leading-tight">
                    Nessun dipendente disponibile
                  </AlertDescription>
                </Alert>
              )}
              
              {isLoading ? (
                <div className="flex items-center justify-center py-4 px-4 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">Caricamento...</span>
                  </div>
                </div>
              ) : (
                <div>
                  <Select value={selectedDipendente} onValueChange={setSelectedDipendente}>
                    <SelectTrigger id="dipendente" className={`w-full ${isMobile ? 'h-12' : 'h-11'} text-sm bg-background`}>
                      <SelectValue placeholder="Seleziona dipendente..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-64 w-full">
                      {/* Available users first */}
                      {availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id} className={`${isMobile ? 'py-3' : 'py-2.5'} hover:bg-accent/50 transition-colors`}>
                          <div className="flex flex-col gap-0.5 w-full">
                            <span className="font-medium text-foreground text-sm leading-tight">
                              {user.first_name && user.last_name 
                                ? `${user.first_name} ${user.last_name}` 
                                : user.first_name || user.last_name || 'Utente senza nome'
                              }
                            </span>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <span className="capitalize text-xs">{user.role}</span>
                              <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                              <span className="text-emerald-600 font-medium text-xs">Disponibile</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                      
                      {/* Unavailable users */}
                      {unavailableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id} disabled className={`${isMobile ? 'py-3' : 'py-2.5'} opacity-50`}>
                          <div className="flex flex-col gap-0.5 w-full">
                            <span className="font-medium text-muted-foreground text-sm leading-tight">
                              {user.first_name && user.last_name 
                                ? `${user.first_name} ${user.last_name}` 
                                : user.first_name || user.last_name || 'Utente senza nome'
                              }
                            </span>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <span className="capitalize text-xs">{user.role}</span>
                              <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                              <span className="text-red-600 font-medium text-xs">Non disponibile</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                      
                      {users.length === 0 && (
                        <div className="p-2.5 text-center text-xs text-muted-foreground">
                          Nessun dipendente trovato
                        </div>
                      )}
                  </SelectContent>
                </Select>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Veicolo Selection (opzionale) */}
        <div className="space-y-3">
          <Label htmlFor="veicolo" className="text-sm font-semibold">
            Veicolo <span className="text-muted-foreground text-xs font-normal">(opzionale)</span>
          </Label>
          <Select value={selectedVeicolo || 'none'} onValueChange={(v) => setSelectedVeicolo(v === 'none' ? '' : v)}>
            <SelectTrigger id="veicolo" className={`w-full ${isMobile ? 'h-12' : 'h-11'} text-sm bg-background`}>
              <SelectValue placeholder="Seleziona veicolo..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className={isMobile ? 'py-3' : 'py-2.5'}>Nessun veicolo</SelectItem>
              {veicoliAttivi?.map((veicolo) => (
                <SelectItem key={veicolo.id} value={veicolo.id} className={isMobile ? 'py-3' : 'py-2.5'}>
                  {veicolo.modello} - {veicolo.targa}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Warning se non selezionato */}
        {!selectedDipendente && !isConducenteEsterno && (
          <Alert className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200 text-sm ml-2">
              Seleziona un dipendente per continuare
            </AlertDescription>
          </Alert>
        )}
        {!selectedConducenteEsternoId && isConducenteEsterno && (
          <Alert className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200 text-sm ml-2">
              Seleziona un conducente esterno per continuare
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      {/* Action Footer - Fixed bottom */}
      <div className={`sticky bottom-0 ${isMobile ? 'px-6 py-4' : 'px-6 py-4'} border-t bg-background`}>
        <div className="flex gap-3 max-w-full">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className={`flex-1 ${isMobile ? 'h-12 text-base' : 'h-11'} font-medium`}
            disabled={isSubmitting}
          >
            Annulla
          </Button>
          <Button 
            onClick={handleAssign}
            disabled={isAssignDisabled}
            className={`flex-1 ${isMobile ? 'h-12 text-base' : 'h-11'} font-semibold`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assegna...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Assegna
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="bottom" 
          className="h-[85vh] flex flex-col p-0 rounded-t-2xl border-t"
        >
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle className="text-xl font-semibold">Assegna Servizio</SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground mt-1">
              Seleziona conducente e veicolo
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {content}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b space-y-2">
          <DialogTitle className="text-xl font-semibold">Assegna Servizio</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Seleziona il conducente e opzionalmente un veicolo
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}