import { useFormContext } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MobileInput } from "@/components/ui/mobile-input";
import { Textarea } from "@/components/ui/textarea";
import { MobileTextarea } from "@/components/ui/mobile-input";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchClientiPrivati } from "@/lib/api/clientiPrivati";
import { ServizioFormData } from "@/lib/types/servizi";
import { Label } from "@/components/ui/label";

export function ClientePrivatoFields() {
  const form = useFormContext<ServizioFormData>();
  const watchSalvaCliente = form.watch('salva_cliente_anagrafica') as boolean;
  const watchClientePrivatoId = form.watch('cliente_privato_id') as string | null | undefined;

  // Fetch clienti privati esistenti
  const { data: clientiPrivati, isLoading } = useQuery({
    queryKey: ['clienti-privati'],
    queryFn: fetchClientiPrivati,
  });

  const handleSelectCliente = (clienteId: string) => {
    if (!clienteId) {
      // Reset fields
      form.setValue('cliente_privato_id', null);
      form.setValue('cliente_privato_nome', '');
      form.setValue('cliente_privato_cognome', '');
      form.setValue('cliente_privato_email', '');
      form.setValue('cliente_privato_telefono', '');
      return;
    }

    const cliente = clientiPrivati?.find(c => c.id === clienteId);
    if (cliente) {
      form.setValue('cliente_privato_id', cliente.id);
      form.setValue('cliente_privato_nome', cliente.nome);
      form.setValue('cliente_privato_cognome', cliente.cognome);
      form.setValue('cliente_privato_email', cliente.email || '');
      form.setValue('cliente_privato_telefono', cliente.telefono || '');
    }
  };

  return (
    <div className="space-y-4">
      {/* Dropdown Clienti Esistenti (se ce ne sono) */}
      {clientiPrivati && clientiPrivati.length > 0 && (
        <FormField
          control={form.control}
          name="cliente_privato_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente Esistente</FormLabel>
              <Select 
                onValueChange={handleSelectCliente}
                value={(field.value as string) || ""}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona o crea nuovo cliente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">➕ Nuovo cliente</SelectItem>
                  {clientiPrivati.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome} {cliente.cognome}
                      {cliente.email && ` - ${cliente.email}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Seleziona un cliente già in anagrafica o crea un nuovo cliente
              </FormDescription>
            </FormItem>
          )}
        />
      )}

      {/* Nome + Cognome (Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-base md:text-sm">Nome *</Label>
          <MobileInput 
            placeholder="Mario" 
            {...form.register("cliente_privato_nome")}
            disabled={!!watchClientePrivatoId}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-base md:text-sm">Cognome *</Label>
          <MobileInput 
            placeholder="Rossi" 
            {...form.register("cliente_privato_cognome")}
            disabled={!!watchClientePrivatoId}
          />
        </div>
      </div>

      {/* Email + Telefono (Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-base md:text-sm">Email</Label>
          <MobileInput 
            type="email" 
            placeholder="mario.rossi@email.com" 
            {...form.register("cliente_privato_email")}
            disabled={!!watchClientePrivatoId}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-base md:text-sm">Telefono</Label>
          <MobileInput 
            placeholder="+39 333 1234567" 
            {...form.register("cliente_privato_telefono")}
            disabled={!!watchClientePrivatoId}
          />
        </div>
      </div>

      {/* Checkbox: Salva in Anagrafica (solo se nuovo cliente) */}
      {!watchClientePrivatoId && (
        <FormField
          control={form.control}
          name="salva_cliente_anagrafica"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value as boolean}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Salva cliente in anagrafica
                </FormLabel>
                <FormDescription>
                  Il cliente sarà disponibile per essere riutilizzato nei prossimi servizi
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      )}

      {/* Campi Extra (solo se salva in anagrafica) */}
      {watchSalvaCliente && !watchClientePrivatoId && (
        <>
          <div className="space-y-2">
            <Label className="text-base md:text-sm">Indirizzo</Label>
            <MobileInput 
              placeholder="Via Roma 123" 
              {...form.register("cliente_privato_indirizzo")}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base md:text-sm">Città</Label>
            <MobileInput 
              placeholder="Milano" 
              {...form.register("cliente_privato_citta")}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base md:text-sm">Note</Label>
            <MobileTextarea
              placeholder="Note aggiuntive sul cliente..." 
              {...form.register("cliente_privato_note")}
              rows={3}
            />
          </div>
        </>
      )}
    </div>
  );
}
