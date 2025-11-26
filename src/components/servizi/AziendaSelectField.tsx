
import { useState, useEffect } from 'react';
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Check, ChevronsUpDown, Loader2, PlusCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Azienda } from "@/lib/types";
import { ServizioFormData } from "@/lib/types/servizi";
import { supabase } from '@/lib/supabase';
import { AziendaDialog } from '@/components/aziende/AziendaDialog';
import { AziendaFormData, createAzienda } from '@/lib/api/aziende';

export function AziendaSelectField() {
  const { control, setValue, watch } = useFormContext<ServizioFormData>();
  const [aziende, setAziende] = useState<Azienda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAzienda, setSelectedAzienda] = useState<Azienda | null>(null);
  const [isCreatingAzienda, setIsCreatingAzienda] = useState(false);
  const [isAziendaDialogOpen, setIsAziendaDialogOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const watchedAziendaId = watch('azienda_id');

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

  // Sincronizza selectedAzienda quando cambia azienda_id
  useEffect(() => {
    if (watchedAziendaId) {
      const azienda = aziende.find(a => a.id === watchedAziendaId);
      if (azienda) {
        setSelectedAzienda(azienda);
      }
    } else {
      setSelectedAzienda(null);
    }
  }, [watchedAziendaId, aziende]);

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
        setSelectedAzienda(azienda);
        setValue('azienda_id', azienda.id);
        setIsAziendaDialogOpen(false);
        setOpen(false);
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
          <FormItem className="flex flex-col">
            <FormLabel>Azienda *</FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                    <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                      "w-full justify-between font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <span className="truncate md:overflow-visible md:whitespace-normal">
                      {selectedAzienda ? selectedAzienda.nome : "Seleziona azienda..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent 
                className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover" 
                align="start"
              >
                <Command shouldFilter={false}>
                  <CommandInput 
                    placeholder="Cerca azienda..." 
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                  />
                  <CommandList>
                    {isLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>
                          <div className="text-center text-sm text-muted-foreground py-4">
                            Nessuna azienda trovata
                          </div>
                        </CommandEmpty>
                        <CommandGroup>
                          {filteredAziende.map((azienda) => (
                            <CommandItem
                              key={azienda.id}
                              value={azienda.id}
                              onSelect={() => {
                                setSelectedAzienda(azienda);
                                setValue('azienda_id', azienda.id);
                                setSearchTerm('');
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === azienda.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {azienda.nome}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setOpen(false);
                        setIsAziendaDialogOpen(true);
                      }}
                      className="text-primary cursor-pointer"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Crea nuova azienda
                    </CommandItem>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
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
