
import { useState, useEffect } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { Servizio, StatoServizio } from '@/lib/types/servizi';
import { Profile, UserRole } from '@/lib/types';
import { getAvailableUsers } from '../utils/userAvailability';
import { ConducenteEsternoForm } from './ConducenteEsternoForm';
import { DipendenteSelectForm } from './DipendenteSelectForm';

interface AssegnazioneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  servizio: Servizio;
}

export function AssegnazioneDialog({ 
  open, 
  onOpenChange, 
  onClose, 
  servizio 
}: AssegnazioneDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConducenteEsterno, setIsConducenteEsterno] = useState(false);
  const [conducenteEsternoNome, setConducenteEsternoNome] = useState('');
  const [conducenteEsternoEmail, setConducenteEsternoEmail] = useState('');
  const [selectedDipendente, setSelectedDipendente] = useState<string>('');
  
  // Query for available users based on shifts and existing assignments
  const { data: availableUsers, isLoading: isLoadingAvailableUsers } = useQuery({
    queryKey: ['available-users', servizio.data_servizio, servizio.id],
    queryFn: () => getAvailableUsers(servizio.data_servizio, servizio.id),
    enabled: open, // Only run the query when the dialog is open
  });

  // Get all users to create unavailable users list
  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'socio', 'dipendente']);
      
      // Ensure that the fetched users have the correct UserRole type
      return (data || []).map(user => ({
        ...user,
        role: user.role as UserRole // explicitly casting to UserRole type
      })) as Profile[];
    },
    enabled: open,
  });

  // Create a list of unavailable users
  const availableUserMap = new Map<string, boolean>();
  availableUsers?.forEach(user => availableUserMap.set(user.id, true));
  
  const unavailableUsers = allUsers.filter(
    user => !availableUserMap.get(user.id) && 
    (user.role === 'admin' || user.role === 'socio' || user.role === 'dipendente')
  );

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setIsConducenteEsterno(!!servizio.conducente_esterno);
      setConducenteEsternoNome(servizio.conducente_esterno_nome || '');
      setConducenteEsternoEmail(servizio.conducente_esterno_email || '');
      setSelectedDipendente(servizio.assegnato_a || '');
    }
  }, [open, servizio]);

  const handleAssign = async () => {
    try {
      setIsSubmitting(true);
      
      let updateData: {
        stato: StatoServizio;
        assegnato_a?: string | null;
        conducente_esterno?: boolean;
        conducente_esterno_nome?: string | null;
        conducente_esterno_email?: string | null;
      } = {
        stato: 'assegnato'
      };
      
      if (isConducenteEsterno) {
        updateData = {
          ...updateData,
          conducente_esterno: true,
          conducente_esterno_nome: conducenteEsternoNome,
          conducente_esterno_email: conducenteEsternoEmail || null,
          assegnato_a: null
        };
      } else {
        updateData = {
          ...updateData,
          conducente_esterno: false,
          conducente_esterno_nome: null,
          conducente_esterno_email: null,
          assegnato_a: selectedDipendente
        };
      }
      
      const { error } = await supabase
        .from('servizi')
        .update(updateData)
        .eq('id', servizio.id);
      
      if (error) throw error;
      
      toast.success('Servizio assegnato con successo');
      queryClient.invalidateQueries({ queryKey: ['servizi'] });
      onClose();
    } catch (error: any) {
      console.error('Error assigning service:', error);
      toast.error(`Errore nell'assegnazione del servizio: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assegna Servizio</DialogTitle>
        </DialogHeader>
        
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
            <ConducenteEsternoForm
              servizio={servizio}
              conducenteEsternoNome={conducenteEsternoNome}
              setConducenteEsternoNome={setConducenteEsternoNome}
              conducenteEsternoEmail={conducenteEsternoEmail}
              setConducenteEsternoEmail={setConducenteEsternoEmail}
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
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Annulla
          </Button>
          <Button 
            onClick={handleAssign}
            disabled={
              isSubmitting || 
              (isConducenteEsterno ? !conducenteEsternoNome : !selectedDipendente)
            }
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assegna
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
