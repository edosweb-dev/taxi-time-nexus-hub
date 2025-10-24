
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
  const [inputValue, setInputValue] = useState('');
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
        setInputValue(azienda.nome);
      }
    } else {
      setSelectedAzienda(null);
      setInputValue('');
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
        setInputValue(azienda.nome);
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
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Digita per cercare azienda..."
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        setSearchTerm(e.target.value);
                        setOpen(true);
                      }}
                      onFocus={() => {
                        setOpen(true);
                      }}
                      className="w-full pr-16"
                    />
                    {selectedAzienda && (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-8 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAzienda(null);
                            setInputValue('');
                            setValue('azienda_id', '');
                            setSearchTerm('');
                            setOpen(false);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                      </>
                    )}
                  </div>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent 
                className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover" 
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <Command shouldFilter={false}>
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
                                setInputValue(azienda.nome);
                                setValue('azienda_id', azienda.id);
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
