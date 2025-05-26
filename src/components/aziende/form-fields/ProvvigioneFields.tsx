
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control, useWatch } from "react-hook-form";

interface ProvvigioneFieldsProps {
  control: Control<any>;
}

export function ProvvigioneFields({ control }: ProvvigioneFieldsProps) {
  const provvigioneAttiva = useWatch({
    control,
    name: "provvigione",
    defaultValue: false,
  });

  if (!provvigioneAttiva) {
    return null;
  }

  return (
    <div className="space-y-4 pl-4 border-l-2 border-muted">
      <FormField
        control={control}
        name="provvigione_tipo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo Provvigione</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona il tipo di provvigione" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="fisso">Valore Fisso</SelectItem>
                <SelectItem value="percentuale">Percentuale</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Scegli se la provvigione è un valore fisso o una percentuale
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="provvigione_valore"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Valore Provvigione</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Inserisci il valore"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              />
            </FormControl>
            <FormDescription>
              {useWatch({ control, name: "provvigione_tipo" }) === "percentuale" 
                ? "Inserisci la percentuale (es. 10 per 10%)"
                : "Inserisci il valore fisso in euro"
              }
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
