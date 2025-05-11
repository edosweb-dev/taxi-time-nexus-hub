
import { useState, useEffect } from 'react';
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, User } from "lucide-react";
import { ServizioFormData } from "@/lib/types/servizi";
import { supabase } from '@/lib/supabase';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Referente {
  id: string;
  first_name: string;
  last_name: string;
}

export function ReferenteSelectField({ aziendaId }: { aziendaId: string }) {
  const { control, setValue } = useFormContext<ServizioFormData>();
  const [referenti, setReferenti] = useState<Referente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newReferente, setNewReferente] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [isCreatingReferente, setIsCreatingReferente] = useState(false);

  // Carica la lista di referenti dell'azienda selezionata
  useEffect(() => {
    if (!aziendaId) {
      setReferenti([]);
      setIsLoading(false);
      return;
    }

    async function fetchReferenti() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .eq('azienda_id', aziendaId)
          .eq('role', 'cliente')
          .order('first_name');

        if (error) throw error;
        setReferenti(data || []);
      } catch (error) {
        console.error('Error fetching referenti:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReferenti();
  }, [aziendaId]);

  const filteredReferenti = referenti.filter(
    (referente) => 
      `${referente.first_name} ${referente.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateReferente = async () => {
    if (!newReferente.firstName || !newReferente.lastName || !newReferente.email) {
      return;
    }

    try {
      setIsCreatingReferente(true);

      // Crea un nuovo utente con ruolo cliente
      const { data, error } = await supabase.auth.admin.createUser({
        email: newReferente.email,
        password: Math.random().toString(36).slice(2, 10), // Password casuale temporanea
        email_confirm: true,
        user_metadata: {
          first_name: newReferente.firstName,
          last_name: newReferente.lastName,
        },
        app_metadata: {
          role: 'cliente',
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Aggiorna il profilo con l'azienda_id
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: newReferente.firstName,
            last_name: newReferente.lastName,
            azienda_id: aziendaId,
          })
          .eq('id', data.user.id)
          .select();

        if (profileError) {
          throw profileError;
        }

        if (profileData && profileData.length > 0) {
          // Aggiungi il nuovo referente alla lista e selezionalo
          const newReferenteData = {
            id: data.user.id,
            first_name: newReferente.firstName,
            last_name: newReferente.lastName,
          };
          
          setReferenti(prev => [...prev, newReferenteData]);
          setValue('referente_id', data.user.id);
          setNewReferente({ firstName: '', lastName: '', email: '' });
        }
      }
    } catch (error: any) {
      console.error('Error creating referente:', error);
    } finally {
      setIsCreatingReferente(false);
    }
  };

  return (
    <>
      <FormField
        control={control}
        name="referente_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Referente *</FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={!aziendaId}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un referente" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {aziendaId ? (
                  <>
                    <div className="p-2">
                      <Input
                        placeholder="Cerca referente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-2"
                      />
                    </div>
                    
                    {isLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : filteredReferenti.length > 0 ? (
                      filteredReferenti.map((referente) => (
                        <SelectItem key={referente.id} value={referente.id}>
                          {`${referente.first_name} ${referente.last_name}`}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        Nessun referente trovato
                      </div>
                    )}
                    
                    <div className="p-2 border-t">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            className="w-full flex items-center justify-center"
                            type="button"
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Crea nuovo referente
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Crea nuovo referente</DialogTitle>
                          </DialogHeader>
                          
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <FormLabel htmlFor="first_name">Nome</FormLabel>
                                <Input
                                  id="first_name"
                                  value={newReferente.firstName}
                                  onChange={(e) => setNewReferente(prev => ({ ...prev, firstName: e.target.value }))}
                                  placeholder="Mario"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <FormLabel htmlFor="last_name">Cognome</FormLabel>
                                <Input
                                  id="last_name"
                                  value={newReferente.lastName}
                                  onChange={(e) => setNewReferente(prev => ({ ...prev, lastName: e.target.value }))}
                                  placeholder="Rossi"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <FormLabel htmlFor="email">Email</FormLabel>
                              <Input
                                id="email"
                                type="email"
                                value={newReferente.email}
                                onChange={(e) => setNewReferente(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="mario.rossi@example.com"
                                className="mt-1"
                              />
                            </div>
                          </div>

                          <DialogFooter className="sm:justify-end">
                            <DialogClose asChild>
                              <Button type="button" variant="outline">Annulla</Button>
                            </DialogClose>
                            <Button 
                              type="button" 
                              onClick={handleCreateReferente}
                              disabled={isCreatingReferente || !newReferente.firstName || !newReferente.lastName || !newReferente.email}
                            >
                              {isCreatingReferente && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Crea referente
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </>
                ) : (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    Seleziona prima un'azienda
                  </div>
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
