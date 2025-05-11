
import { useState, useEffect } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useUsers } from '@/hooks/useUsers';
import { Servizio, StatoServizio } from '@/lib/types/servizi';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MailIcon, UserIcon } from 'lucide-react';
import { getAvailableUsers } from './utils/userAvailability';
import { Profile } from '@/lib/types';

interface AssegnazioneDialogProps {
  isOpen: boolean;
  onClose: () => void;
  servizio: Servizio;
}

export function AssegnazioneDialog({ isOpen, onClose, servizio }: AssegnazioneDialogProps) {
  const { users } = useUsers();
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
    enabled: isOpen, // Only run the query when the dialog is open
  });

  useEffect(() => {
    if (isOpen) {
      // Reset form when dialog opens
      setIsConducenteEsterno(!!servizio.conducente_esterno);
      setConducenteEsternoNome(servizio.conducente_esterno_nome || '');
      setConducenteEsternoEmail(servizio.conducente_esterno_email || '');
      setSelectedDipendente(servizio.assegnato_a || '');
    }
  }, [isOpen, servizio]);

  const handleAssign = async () => {
    try {
      setIsSubmitting(true);
      
      let updateData: {
        stato: StatoServizio;
        assegnato_a?: string;
        conducente_esterno?: boolean;
        conducente_esterno_nome?: string;
        conducente_esterno_email?: string;
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

  // Create a filtered list to show available users first, then unavailable users
  const allUsers = users.filter(user => 
    user.role === 'admin' || user.role === 'socio' || user.role === 'dipendente'
  );

  // Prepare a map of user IDs to determine which ones are available
  const availableUserMap = new Map<string, boolean>();
  availableUsers?.forEach(user => availableUserMap.set(user.id, true));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
            <div className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="nome-conducente">Nome e Cognome</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="nome-conducente"
                    placeholder="Mario Rossi"
                    value={conducenteEsternoNome}
                    onChange={(e) => setConducenteEsternoNome(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="email-conducente">Email (opzionale)</Label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email-conducente"
                    type="email"
                    placeholder="mario.rossi@example.com"
                    value={conducenteEsternoEmail}
                    onChange={(e) => setConducenteEsternoEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="dipendente-select">Seleziona Dipendente</Label>
              <Select value={selectedDipendente} onValueChange={setSelectedDipendente}>
                <SelectTrigger id="dipendente-select">
                  <SelectValue placeholder="Seleziona un dipendente" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {isLoadingAvailableUsers ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : allUsers.length > 0 ? (
                    <>
                      <div className="p-2 text-sm font-medium text-foreground bg-muted/50">
                        Dipendenti disponibili
                      </div>
                      {availableUsers?.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} ({user.role === 'admin' ? 'Amministratore' : 
                            user.role === 'socio' ? 'Socio' : 'Dipendente'})
                        </SelectItem>
                      ))}
                      
                      {/* Show unavailable users separately */}
                      {allUsers.filter(user => !availableUserMap.get(user.id)).length > 0 && (
                        <>
                          <div className="p-2 text-sm font-medium text-foreground bg-muted/50 mt-2">
                            Dipendenti non disponibili
                          </div>
                          {allUsers
                            .filter(user => !availableUserMap.get(user.id))
                            .map((user) => (
                              <SelectItem key={user.id} value={user.id} disabled className="text-muted-foreground">
                                {user.first_name} {user.last_name} ({user.role === 'admin' ? 'Amministratore' : 
                                  user.role === 'socio' ? 'Socio' : 'Dipendente'})
                              </SelectItem>
                            ))
                          }
                        </>
                      )}
                    </>
                  ) : (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      Nessun dipendente disponibile
                    </div>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                I dipendenti non disponibili sono già assegnati, senza turno, o in malattia/ferie per questa data.
              </p>
            </div>
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
