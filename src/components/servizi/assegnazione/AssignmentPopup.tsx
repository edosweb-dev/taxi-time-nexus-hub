import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Servizio, StatoServizio } from '@/lib/types/servizi';
import { useAssignmentUsers } from '@/hooks/useAssignmentUsers';
import { ConducenteEsternoSelect } from './ConducenteEsternoSelect';

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
  const [isConducenteEsterno, setIsConducenteEsterno] = useState(false);
  const [selectedConducenteEsternoId, setSelectedConducenteEsternoId] = useState('');
  const [selectedDipendente, setSelectedDipendente] = useState<string>('');
  
  const { 
    users, 
    availableUsers, 
    unavailableUsers, 
    isLoading, 
    error,
    hasShiftsConfigured 
  } = useAssignmentUsers(servizio.data_servizio, servizio.id);
  
  console.log('[AssignmentPopup] Popup opened for service:', {
    id: servizio.id,
    data_servizio: servizio.data_servizio,
    stato: servizio.stato,
    availableCount: availableUsers.length,
    unavailableCount: unavailableUsers.length,
    hasShiftsConfigured
  });

  // Reset form when popup opens
  useEffect(() => {
    if (open) {
      setIsConducenteEsterno(!!servizio.conducente_esterno);
      setSelectedConducenteEsternoId(servizio.conducente_esterno_id || '');
      setSelectedDipendente(servizio.assegnato_a || '');
      console.log('[AssignmentPopup] Form reset with existing values:', {
        conducenteEsterno: !!servizio.conducente_esterno,
        conducenteEsternoId: servizio.conducente_esterno_id,
        assegnatoA: servizio.assegnato_a
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
      
      let updateData: {
        stato: StatoServizio;
        assegnato_a?: string | null;
        conducente_esterno?: boolean;
        conducente_esterno_id?: string | null;
        conducente_esterno_nome?: string | null;
        conducente_esterno_email?: string | null;
      } = {
        stato: 'assegnato'
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
      
      const { error } = await supabase
        .from('servizi')
        .update(updateData)
        .eq('id', servizio.id);
      
      if (error) {
        console.error('[AssignmentPopup] Assignment error:', error);
        throw error;
      }
      
      console.log('[AssignmentPopup] Assignment successful');
      toast.success('Servizio assegnato con successo');
      queryClient.invalidateQueries({ queryKey: ['servizi'] });
      onClose();
    } catch (error: any) {
      console.error('[AssignmentPopup] Error assigning service:', error);
      toast.error(`Errore nell'assegnazione del servizio: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAssignDisabled = isSubmitting || 
    (isConducenteEsterno ? !selectedConducenteEsternoId : !selectedDipendente);

  const content = (
    <>
      {/* Main Content Area */}
      <div className={`${isMobile ? 'px-4 pb-2' : 'px-6 pb-3'} space-y-4`}>
        
        {/* Driver Type Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">Tipo di conducente</Label>
          <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/40 hover:bg-muted/30 transition-colors">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">Conducente Esterno</span>
              <span className="text-xs text-muted-foreground">
                {isConducenteEsterno ? 'Assegna a conducente esterno' : 'Assegna a dipendente interno'}
              </span>
            </div>
            <Switch 
              id="conducente-esterno" 
              checked={isConducenteEsterno}
              onCheckedChange={setIsConducenteEsterno}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>
        
        {/* Selection Area */}
        <div className="space-y-3">
          {isConducenteEsterno ? (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Conducente Esterno</Label>
              <ConducenteEsternoSelect
                selectedConducenteId={selectedConducenteEsternoId}
                setSelectedConducenteId={setSelectedConducenteEsternoId}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Seleziona Dipendente</Label>
              
              {/* Alert for no available users */}
              {!isLoading && availableUsers.length === 0 && (
                <Alert className="border-amber-200 bg-amber-50 py-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 text-sm">
                    Nessun dipendente disponibile al momento.
                  </AlertDescription>
                </Alert>
              )}
              
              {isLoading ? (
                <div className="flex items-center justify-center py-6 px-4">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">Caricamento...</span>
                  </div>
                </div>
              ) : (
                <Select value={selectedDipendente} onValueChange={setSelectedDipendente}>
                  <SelectTrigger className="w-full h-10 text-sm">
                    <SelectValue placeholder="Scegli un dipendente..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[160px]">
                    {/* Available users first */}
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id} className="py-2">
                        <div className="flex flex-col gap-0.5 w-full">
                          <span className="font-medium text-foreground text-sm">
                            {user.first_name && user.last_name 
                              ? `${user.first_name} ${user.last_name}` 
                              : user.first_name || user.last_name || 'Utente senza nome'
                            }
                          </span>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="capitalize">{user.role}</span>
                            <span className="text-emerald-600 font-medium">Disponibile</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                    
                    {/* Unavailable users */}
                    {unavailableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id} disabled className="py-2 opacity-60">
                        <div className="flex flex-col gap-0.5 w-full">
                          <span className="font-medium text-muted-foreground text-sm">
                            {user.first_name && user.last_name 
                              ? `${user.first_name} ${user.last_name}` 
                              : user.first_name || user.last_name || 'Utente senza nome'
                            }
                          </span>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="capitalize">{user.role}</span>
                            <span className="text-red-600 font-medium">Non disponibile</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                    
                    {users.length === 0 && (
                      <div className="p-3 text-center text-xs text-muted-foreground">
                        Nessun dipendente trovato
                      </div>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Action Footer */}
      <div className={`sticky bottom-0 ${isMobile ? 'p-3' : 'p-4'} pt-3 border-t bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-lg`}>
        <div className="flex w-full gap-2">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="flex-1 h-10 text-sm font-medium border-2 hover:bg-muted/50 transition-all duration-200"
            disabled={isSubmitting}
          >
            Annulla
          </Button>
          <Button 
            onClick={handleAssign}
            disabled={isAssignDisabled}
            className="flex-1 h-10 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Assegnazione...
              </>
            ) : (
              'Assegna Servizio'
            )}
          </Button>
        </div>
        
        {/* Validation Message */}
        {isAssignDisabled && !isSubmitting && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800 text-center">
              {isConducenteEsterno 
                ? 'Seleziona un conducente esterno' 
                : 'Seleziona un dipendente'
              }
            </p>
          </div>
        )}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[80vh] flex flex-col p-0 rounded-t-xl border-t">
          <SheetHeader className="p-4 pb-3 border-b bg-background/95">
            <SheetTitle className="text-lg font-bold text-foreground">Assegna Servizio</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Seleziona un conducente per questo servizio
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            {content}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-md mx-auto p-0 gap-0 rounded-lg border shadow-xl">
        <DialogHeader className="p-4 pb-3 border-b bg-background/95">
          <DialogTitle className="text-lg font-bold text-foreground">Assegna Servizio</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Seleziona un conducente per questo servizio
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}