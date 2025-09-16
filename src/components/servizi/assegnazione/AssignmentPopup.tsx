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
      <div className={`${isMobile ? 'px-4 pb-1' : 'px-5 pb-2'} space-y-3 animate-fade-in`}>
        
        {/* Driver Type Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Tipo di conducente</Label>
           <div className="flex items-center justify-between p-2 rounded border">
             <span className="text-sm">Conducente Esterno</span>
             <Switch 
               id="conducente-esterno" 
               checked={isConducenteEsterno}
               onCheckedChange={setIsConducenteEsterno}
             />
           </div>
        </div>
        
        {/* Selection Area */}
        <div className="space-y-2">
          {isConducenteEsterno ? (
            <div className="space-y-1.5 animate-scale-in">
              <Label className="text-sm font-medium text-foreground">Conducente Esterno</Label>
              <ConducenteEsternoSelect
                selectedConducenteId={selectedConducenteEsternoId}
                setSelectedConducenteId={setSelectedConducenteEsternoId}
              />
            </div>
          ) : (
            <div className="space-y-1.5 animate-scale-in">
              <Label className="text-sm font-medium text-foreground">Seleziona Dipendente</Label>
              
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
                <div className="animate-scale-in">
                  <Select value={selectedDipendente} onValueChange={setSelectedDipendente}>
                    <SelectTrigger className="w-full h-9 text-sm border-border/50 hover:border-border transition-colors">
                      <SelectValue placeholder="Scegli un dipendente..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[140px] animate-scale-in">
                      {/* Available users first */}
                      {availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id} className="py-1.5 hover:bg-accent/50 transition-colors">
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
                        <SelectItem key={user.id} value={user.id} disabled className="py-1.5 opacity-50">
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
                        <div className="p-2.5 text-center text-xs text-muted-foreground animate-fade-in">
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
      </div>
      
      {/* Action Footer */}
      <div className={`sticky bottom-0 ${isMobile ? 'px-4 py-2.5' : 'px-5 py-3'} border-t bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/90 shadow-sm`}>
        <div className="flex w-full gap-2.5 max-w-full animate-fade-in">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="flex-1 h-9 text-sm font-medium border hover:bg-muted/50 transition-all duration-200 hover-scale"
            disabled={isSubmitting}
          >
            Annulla
          </Button>
          <Button 
            onClick={handleAssign}
            disabled={isAssignDisabled}
            className="flex-1 h-9 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover-scale"
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
          <div className="mt-2 p-1.5 bg-amber-50/80 border border-amber-200/60 rounded-md animate-fade-in">
            <p className="text-xs text-amber-800 text-center leading-tight">
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
        <SheetContent side="bottom" className="h-[75vh] flex flex-col p-0 rounded-t-xl border-t animate-slide-in-right">
          <SheetHeader className="p-3.5 pb-2.5 border-b bg-background/95 backdrop-blur-sm">
            <SheetTitle className="text-lg font-semibold text-foreground">Assegna Servizio</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground leading-tight">
              Seleziona un conducente
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
      <DialogContent className="w-[88vw] max-w-sm mx-auto p-0 gap-0 rounded-xl border shadow-xl animate-scale-in">
        <DialogHeader className="p-3.5 pb-2.5 border-b bg-background/95 backdrop-blur-sm">
          <DialogTitle className="text-lg font-semibold text-foreground">Assegna Servizio</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-tight">
            Seleziona un conducente
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}