import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MobileInput } from "@/components/ui/mobile-input";
import { MobileTextarea } from "@/components/ui/mobile-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchClientiPrivati } from "@/lib/api/clientiPrivati";
import { createClientePrivato } from "@/lib/api/clientiPrivati/createClientePrivato";
import { ServizioFormData } from "@/lib/types/servizi";
import { Label } from "@/components/ui/label";
import { User, UserPlus, Save, Loader2, AlertCircle, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export function ClientePrivatoFields() {
  const form = useFormContext<ServizioFormData>();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [clientiOpen, setClientiOpen] = useState(false);
  
  const watchClientePrivatoId = form.watch('cliente_privato_id') as string | null | undefined;
  const watchNome = form.watch('cliente_privato_nome') as string;
  const watchCognome = form.watch('cliente_privato_cognome') as string;
  const watchEmail = form.watch('cliente_privato_email') as string;
  const watchTelefono = form.watch('cliente_privato_telefono') as string;
  const watchIndirizzo = form.watch('cliente_privato_indirizzo') as string;
  const watchCitta = form.watch('cliente_privato_citta') as string;

  // Fetch clienti privati esistenti
  const { data: clientiPrivati, isLoading } = useQuery({
    queryKey: ['clienti-privati'],
    queryFn: fetchClientiPrivati,
  });

  const isNewCliente = !watchClientePrivatoId;
  const hasMinimalData = (watchNome && watchNome.trim()) || (watchCognome && watchCognome.trim());
  const canSave = isNewCliente && hasMinimalData && !isSaving;

  const handleSelectCliente = (clienteId: string) => {
    if (!clienteId || clienteId === "__new__") {
      // Reset fields
      form.setValue('cliente_privato_id', null);
      form.setValue('cliente_privato_nome', '');
      form.setValue('cliente_privato_cognome', '');
      form.setValue('cliente_privato_email', '');
      form.setValue('cliente_privato_telefono', '');
      form.setValue('cliente_privato_indirizzo', '');
      form.setValue('cliente_privato_citta', '');
      form.setValue('cliente_privato_note', '');
      return;
    }

    const cliente = clientiPrivati?.find(c => c.id === clienteId);
    if (cliente) {
      form.setValue('cliente_privato_id', cliente.id);
      form.setValue('cliente_privato_nome', cliente.nome);
      form.setValue('cliente_privato_cognome', cliente.cognome);
      form.setValue('cliente_privato_email', cliente.email || '');
      form.setValue('cliente_privato_telefono', cliente.telefono || '');
      form.setValue('cliente_privato_indirizzo', cliente.indirizzo || '');
      form.setValue('cliente_privato_citta', cliente.citta || '');
      form.setValue('cliente_privato_note', cliente.note || '');
    }
  };

  const handleSalvaInAnagrafica = async () => {
    if (!canSave) return;

    setIsSaving(true);
    try {
      const nuovoCliente = await createClientePrivato({
        nome: watchNome || '',
        cognome: watchCognome || '',
        email: watchEmail || undefined,
        telefono: watchTelefono || undefined,
        indirizzo: watchIndirizzo || undefined,
        citta: watchCitta || undefined,
        note: form.getValues('cliente_privato_note') || undefined,
      });

      // Aggiorna form con ID del nuovo cliente
      form.setValue('cliente_privato_id', nuovoCliente.id);
      form.setValue('salva_cliente_anagrafica', true);

      // Invalida cache per ricaricare lista clienti
      await queryClient.invalidateQueries({ queryKey: ['clienti-privati'] });

      toast.success("Cliente salvato in anagrafica con successo!");
    } catch (error) {
      console.error('Errore salvataggio cliente:', error);
      toast.error("Errore nel salvataggio del cliente in anagrafica");
    } finally {
      setIsSaving(false);
    }
  };

  // Get display label for selected client
  const getSelectedLabel = () => {
    if (!watchClientePrivatoId) return "✨ Nuovo cliente";
    const c = clientiPrivati?.find(c => c.id === watchClientePrivatoId);
    return c ? `${c.nome} ${c.cognome}` : "Seleziona cliente...";
  };

  return (
    <div className="space-y-6">
      {/* SEZIONE 1: Selezione Cliente Esistente - Combobox ricercabile */}
      {clientiPrivati && clientiPrivati.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Clienti in Anagrafica</CardTitle>
            </div>
            <CardDescription className="text-sm">
              Seleziona un cliente già salvato oppure crea un nuovo cliente qui sotto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Popover open={clientiOpen} onOpenChange={setClientiOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={clientiOpen}
                  className="w-full justify-between h-11 font-normal"
                  disabled={isLoading}
                >
                  {getSelectedLabel()}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Cerca per nome, cognome, email..." />
                  <CommandList>
                    <CommandEmpty>Nessun cliente trovato.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="__new__"
                        onSelect={() => {
                          handleSelectCliente("__new__");
                          setClientiOpen(false);
                        }}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Nuovo cliente
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            !watchClientePrivatoId ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                      {clientiPrivati.map((cliente) => (
                        <CommandItem
                          key={cliente.id}
                          value={`${cliente.nome} ${cliente.cognome} ${cliente.email || ''}`}
                          onSelect={() => {
                            handleSelectCliente(cliente.id);
                            setClientiOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              watchClientePrivatoId === cliente.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{cliente.nome} {cliente.cognome}</span>
                            {(cliente.email || cliente.telefono) && (
                              <span className="text-xs text-muted-foreground">
                                {cliente.email && cliente.email}
                                {cliente.email && cliente.telefono && ' • '}
                                {cliente.telefono && cliente.telefono}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>
      )}

      {/* SEZIONE 2: Dati Cliente */}
      <Card className={isNewCliente ? "border-primary/20" : "border-muted"}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isNewCliente ? (
                <UserPlus className="h-5 w-5 text-primary" />
              ) : (
                <User className="h-5 w-5 text-muted-foreground" />
              )}
              <CardTitle className="text-base">
                {isNewCliente ? "Nuovo Cliente" : "Dati Cliente"}
              </CardTitle>
            </div>
            
            {/* Pulsante SALVA in Anagrafica */}
            {isNewCliente && (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleSalvaInAnagrafica}
                disabled={!canSave}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvataggio...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salva
                  </>
                )}
              </Button>
            )}
          </div>
          <CardDescription className="text-sm">
            {isNewCliente 
              ? "Inserisci i dati del nuovo cliente. Clicca 'Salva in Anagrafica' per riutilizzarlo nei prossimi servizi."
              : "Cliente salvato in anagrafica. I campi sono di sola lettura."
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Alert info per nuovo cliente */}
          {isNewCliente && !hasMinimalData && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Inserisci almeno <strong>Nome</strong> o <strong>Cognome</strong> per poter salvare il cliente
              </AlertDescription>
            </Alert>
          )}

          {/* Nome + Cognome (Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="cliente_privato_nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base md:text-sm">Nome</FormLabel>
                  <FormControl>
                    <MobileInput 
                      placeholder="Mario" 
                      {...field}
                      value={field.value || ''}
                      disabled={!isNewCliente}
                      className={!isNewCliente ? "bg-muted" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cliente_privato_cognome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base md:text-sm">Cognome</FormLabel>
                  <FormControl>
                    <MobileInput 
                      placeholder="Rossi" 
                      {...field}
                      value={field.value || ''}
                      disabled={!isNewCliente}
                      className={!isNewCliente ? "bg-muted" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Email + Telefono (Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="cliente_privato_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base md:text-sm">Email</FormLabel>
                  <FormControl>
                    <MobileInput 
                      type="email" 
                      placeholder="mario.rossi@email.com" 
                      {...field}
                      value={field.value || ''}
                      disabled={!isNewCliente}
                      className={!isNewCliente ? "bg-muted" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cliente_privato_telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base md:text-sm">Telefono</FormLabel>
                  <FormControl>
                    <MobileInput 
                      placeholder="+39 333 1234567" 
                      {...field}
                      value={field.value || ''}
                      disabled={!isNewCliente}
                      className={!isNewCliente ? "bg-muted" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Indirizzo + Città (Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="cliente_privato_indirizzo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base md:text-sm">Indirizzo</FormLabel>
                  <FormControl>
                    <MobileInput 
                      placeholder="Via Roma 123" 
                      {...field}
                      value={field.value || ''}
                      disabled={!isNewCliente}
                      className={!isNewCliente ? "bg-muted" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cliente_privato_citta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base md:text-sm">Città</FormLabel>
                  <FormControl>
                    <MobileInput 
                      placeholder="Milano" 
                      {...field}
                      value={field.value || ''}
                      disabled={!isNewCliente}
                      className={!isNewCliente ? "bg-muted" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Note */}
          <FormField
            control={form.control}
            name="cliente_privato_note"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base md:text-sm">Note</FormLabel>
                <FormControl>
                  <MobileTextarea
                    placeholder="Note aggiuntive sul cliente..." 
                    {...field}
                    value={field.value || ''}
                    disabled={!isNewCliente}
                    className={!isNewCliente ? "bg-muted" : ""}
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
