
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";

interface AziendaNameFieldsProps {
  control: Control<any>;
}

export function AziendaNameFields({ control }: AziendaNameFieldsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Prima riga: Nome azienda | Partita IVA */}
      <FormField
        control={control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome Azienda</FormLabel>
            <FormControl>
              <Input placeholder="Inserisci il nome dell'azienda" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="partita_iva"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Partita IVA</FormLabel>
            <FormControl>
              <Input 
                placeholder="11 cifre numeriche" 
                {...field} 
                maxLength={11}
                onChange={(e) => {
                  // Allow only numbers
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormDescription>
              Deve essere di 11 cifre numeriche
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Seconda riga: Indirizzo | Città */}
      <FormField
        control={control}
        name="indirizzo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Indirizzo</FormLabel>
            <FormControl>
              <Input placeholder="Indirizzo completo" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="citta"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Città</FormLabel>
            <FormControl>
              <Input placeholder="Città" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Terza riga: SDI | PEC */}
      <FormField
        control={control}
        name="sdi"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Codice SDI</FormLabel>
            <FormControl>
              <Input placeholder="Codice SDI per fatturazione elettronica" {...field} value={field.value || ''} />
            </FormControl>
            <FormDescription>
              Codice Sistema di Interscambio per fatturazione elettronica
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="pec"
        render={({ field }) => (
          <FormItem>
            <FormLabel>PEC</FormLabel>
            <FormControl>
              <Input placeholder="Posta Elettronica Certificata" {...field} value={field.value || ''} />
            </FormControl>
            <FormDescription>
              Indirizzo di Posta Elettronica Certificata
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
