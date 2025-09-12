
import { useState, useEffect } from 'react';
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import { Azienda } from "@/lib/types";
import { ServizioFormData } from "@/lib/types/servizi";
import { supabase } from '@/lib/supabase';
import { AziendaDialog } from '@/components/aziende/AziendaDialog';
import { AziendaFormData, createAzienda } from '@/lib/api/aziende';

export function AziendaSelectField() {
  const { control, setValue } = useFormContext<ServizioFormData>();
  const [aziende, setAziende] = useState<Azienda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingAzienda, setIsCreatingAzienda] = useState(false);
  const [isAziendaDialogOpen, setIsAziendaDialogOpen] = useState(false);

  // Carica la lista di aziende
  useEffect(() => {
    async function fetchAziende() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('aziende')
          .select('*')
          .order('nome');

        if (error) throw error;
        setAziende(data || []);
      } catch (error) {
        console.error('Error fetching aziende:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAziende();
  }, []);

  const filteredAziende = aziende.filter(
    (azienda) => azienda.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateAzienda = async (data: AziendaFormData) => {
    try {
      setIsCreatingAzienda(true);
      const { azienda, error } = await createAzienda(data);

      if (error) {
        throw error;
      }

      if (azienda) {
        setAziende((prev) => [...prev, azienda]);
        setValue('azienda_id', azienda.id);
        setIsAziendaDialogOpen(false);
      }
    } catch (error: any) {
      console.error('Error creating azienda:', error);
    } finally {
      setIsCreatingAzienda(false);
    }
  };

  return (
    <>
      <FormField
        control={control}
        name="azienda_id"
        render={({ field }) => (
          <FormItem className="h-full flex flex-col">
            <FormLabel>Azienda *</FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <FormControl className="flex-1">
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Seleziona un'azienda" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-background border shadow-lg z-50">
                <div className="p-2">
                  <Input
                    placeholder="Cerca azienda..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-2"
                  />
                </div>
                
                {isLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredAziende.length > 0 ? (
                  filteredAziende.map((azienda) => (
                    <SelectItem key={azienda.id} value={azienda.id}>
                      {azienda.nome}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    Nessuna azienda trovata
                  </div>
                )}
                
                <div className="p-2 border-t">
                  <Button
                    variant="ghost"
                    className="w-full flex items-center justify-center"
                    onClick={() => setIsAziendaDialogOpen(true)}
                    type="button"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crea nuova azienda
                  </Button>
                </div>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <AziendaDialog
        isOpen={isAziendaDialogOpen}
        onOpenChange={setIsAziendaDialogOpen}
        onSubmit={handleCreateAzienda}
        azienda={null}
        isSubmitting={isCreatingAzienda}
      />
    </>
  );
}
