import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Servizio, StatoServizio } from '@/lib/types/servizi';
import { useAssignmentUsers } from '@/hooks/useAssignmentUsers';
import { UserSelection } from './UserSelection';
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
      <div className={`${isMobile ? 'px-4' : 'px-6'} space-y-6`}>
        <div className="space-y-3">
          <Label className="text-base font-medium">Tipo di conducente</Label>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
            <span className="text-sm font-medium">Conducente Esterno</span>
            <Switch 
              id="conducente-esterno" 
              checked={isConducenteEsterno}
              onCheckedChange={setIsConducenteEsterno}
            />
          </div>
        </div>
        
        <div className="space-y-3">
          {isConducenteEsterno ? (
            <ConducenteEsternoSelect
              selectedConducenteId={selectedConducenteEsternoId}
              setSelectedConducenteId={setSelectedConducenteEsternoId}
            />
          ) : (
            <div className="space-y-3">
              <Label className="text-base font-medium">Seleziona Dipendente</Label>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Caricamento dipendenti...</span>
                </div>
              ) : (
                <UserSelection
                  users={users}
                  selectedUserId={selectedDipendente}
                  onUserSelect={setSelectedDipendente}
                  mobile={isMobile}
                  hasShiftsConfigured={hasShiftsConfigured}
                />
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className={`${isMobile ? 'p-4' : 'p-6'} pt-6 border-t mt-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60`}>
        <div className="flex w-full gap-3">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="flex-1 h-12 text-base font-medium border-2 hover:bg-muted/50"
          >
            Annulla
          </Button>
          <Button 
            onClick={handleAssign}
            disabled={isAssignDisabled}
            className="flex-1 h-12 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {isSubmitting ? 'Assegnazione...' : 'Assegna Servizio'}
          </Button>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[85vh] flex flex-col p-0">
          <SheetHeader className="p-4 pb-2 border-b">
            <SheetTitle className="text-xl font-semibold">Assegna Servizio</SheetTitle>
            <SheetDescription>
              Seleziona un conducente per questo servizio
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-hidden flex flex-col">
            {content}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold">Assegna Servizio</DialogTitle>
          <DialogDescription>
            Seleziona un conducente per questo servizio
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}