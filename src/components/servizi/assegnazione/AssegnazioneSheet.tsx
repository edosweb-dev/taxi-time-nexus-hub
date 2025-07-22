
import { useState, useEffect } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { Servizio, StatoServizio } from '@/lib/types/servizi';
import { Profile, UserRole } from '@/lib/types';
import { getAvailableUsers } from '../utils/userAvailability';
import { ConducenteEsternoSelect } from './ConducenteEsternoSelect';
import { DipendenteSelectForm } from './DipendenteSelectForm';

interface AssegnazioneSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  servizio: Servizio;
}

export function AssegnazioneSheet({ 
  open, 
  onOpenChange, 
  onClose, 
  servizio 
}: AssegnazioneSheetProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConducenteEsterno, setIsConducenteEsterno] = useState(false);
  const [selectedConducenteEsternoId, setSelectedConducenteEsternoId] = useState('');
  const [selectedDipendente, setSelectedDipendente] = useState<string>('');
  
  console.log('[AssegnazioneSheet] Sheet opened for service:', {
    id: servizio.id,
    data_servizio: servizio.data_servizio,
    stato: servizio.stato
  });
  
  // Query for available users based on shifts and existing assignments
  const { data: availableUsers, isLoading: isLoadingAvailableUsers, error: availableUsersError } = useQuery({
    queryKey: ['available-users', servizio.data_servizio, servizio.id],
    queryFn: () => {
      console.log('[AssegnazioneSheet] Fetching available users for:', servizio.data_servizio);
      return getAvailableUsers(servizio.data_servizio, servizio.id);
    },
    enabled: open, // Only run the query when the sheet is open
  });

  // Get all users to create unavailable users list
  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      console.log('[AssegnazioneSheet] Fetching all users');
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'socio', 'dipendente']);
      
      // Ensure that the fetched users have the correct UserRole type
      const users = (data || []).map(user => ({
        ...user,
        role: user.role as UserRole // explicitly casting to UserRole type
      })) as Profile[];
      
      console.log(`[AssegnazioneSheet] Fetched ${users.length} total users`);
      return users;
    },
    enabled: open,
  });

  // Log any errors
  useEffect(() => {
    if (availableUsersError) {
      console.error('[AssegnazioneSheet] Error loading available users:', availableUsersError);
      toast.error('Errore nel caricamento degli utenti disponibili');
    }
  }, [availableUsersError]);

  // Create a list of unavailable users
  const availableUserMap = new Map<string, boolean>();
  availableUsers?.forEach(user => availableUserMap.set(user.id, true));
  
  const unavailableUsers = allUsers.filter(
    user => !availableUserMap.get(user.id) && 
    (user.role === 'admin' || user.role === 'socio' || user.role === 'dipendente')
  );

  console.log('[AssegnazioneSheet] Users summary:', {
    availableCount: availableUsers?.length || 0,
    unavailableCount: unavailableUsers.length,
    totalCount: allUsers.length
  });

  useEffect(() => {
    if (open) {
      // Reset form when sheet opens
      setIsConducenteEsterno(!!servizio.conducente_esterno);
      setSelectedConducenteEsternoId(servizio.conducente_esterno_id || '');
      setSelectedDipendente(servizio.assegnato_a || '');
      console.log('[AssegnazioneSheet] Form reset with existing values:', {
        conducenteEsterno: !!servizio.conducente_esterno,
        conducenteEsternoId: servizio.conducente_esterno_id,
        assegnatoA: servizio.assegnato_a
      });
    }
  }, [open, servizio]);

  const handleAssign = async () => {
    try {
      setIsSubmitting(true);
      console.log('[AssegnazioneSheet] Starting assignment process');
      
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
          conducente_esterno_nome: null, // Clear old manual fields
          conducente_esterno_email: null, // Clear old manual fields
          assegnato_a: null
        };
        console.log('[AssegnazioneSheet] Assigning to external driver ID:', selectedConducenteEsternoId);
      } else {
        updateData = {
          ...updateData,
          conducente_esterno: false,
          conducente_esterno_id: null,
          conducente_esterno_nome: null,
          conducente_esterno_email: null,
          assegnato_a: selectedDipendente
        };
        console.log('[AssegnazioneSheet] Assigning to employee:', selectedDipendente);
      }
      
      const { error } = await supabase
        .from('servizi')
        .update(updateData)
        .eq('id', servizio.id);
      
      if (error) {
        console.error('[AssegnazioneSheet] Assignment error:', error);
        throw error;
      }
      
      console.log('[AssegnazioneSheet] Assignment successful');
      toast.success('Servizio assegnato con successo');
      queryClient.invalidateQueries({ queryKey: ['servizi'] });
      onClose();
    } catch (error: any) {
      console.error('[AssegnazioneSheet] Error assigning service:', error);
      toast.error(`Errore nell'assegnazione del servizio: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Assegna Servizio</SheetTitle>
        </SheetHeader>
        
        <div className="grid gap-6 pt-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="conducente-esterno">Conducente Esterno</Label>
            <Switch 
              id="conducente-esterno" 
              checked={isConducenteEsterno}
              onCheckedChange={setIsConducenteEsterno}
            />
          </div>
          
          {isConducenteEsterno ? (
            <ConducenteEsternoSelect
              selectedConducenteId={selectedConducenteEsternoId}
              setSelectedConducenteId={setSelectedConducenteEsternoId}
            />
          ) : (
            <DipendenteSelectForm
              isLoadingAvailableUsers={isLoadingAvailableUsers}
              selectedDipendente={selectedDipendente}
              setSelectedDipendente={setSelectedDipendente}
              availableUsers={availableUsers}
              unavailableUsers={unavailableUsers}
            />
          )}
          
        </div>
        
        <SheetFooter className="flex justify-between sm:justify-between mt-6">
          <Button variant="outline" onClick={onClose}>
            Annulla
          </Button>
          <Button 
            onClick={handleAssign}
            disabled={
              isSubmitting || 
              (isConducenteEsterno ? !selectedConducenteEsternoId : !selectedDipendente)
            }
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assegna
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
