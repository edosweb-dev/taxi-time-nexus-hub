import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { VeicoloFormData } from '@/lib/types/veicoli';
import { Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const veicoloSchema = z.object({
  modello: z.string().min(1, 'Il modello è obbligatorio'),
  targa: z.string().min(1, 'La targa è obbligatoria'),
  anno: z.number().min(1900).max(new Date().getFullYear() + 1).optional(),
  colore: z.string().optional(),
  numero_posti: z.number().min(1).max(50).optional(),
  note: z.string().optional(),
  attivo: z.boolean().default(true),
});

interface VeicoloFormProps {
  initialData?: Partial<VeicoloFormData>;
  onSubmit: (data: VeicoloFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function VeicoloForm({ initialData, onSubmit, onCancel, isSubmitting }: VeicoloFormProps) {
  const isEditing = !!initialData;
  
  const form = useForm<VeicoloFormData>({
    resolver: zodResolver(veicoloSchema),
    defaultValues: {
      modello: initialData?.modello || '',
      targa: initialData?.targa || '',
      anno: initialData?.anno,
      colore: initialData?.colore || '',
      numero_posti: initialData?.numero_posti,
      note: initialData?.note || '',
      attivo: initialData?.attivo ?? true,
    },
  });

  const handleSubmit = (data: VeicoloFormData) => {
    const formattedData = {
      ...data,
      targa: data.targa.toUpperCase(),
      anno: data.anno || undefined,
      numero_posti: data.numero_posti || undefined,
    };
    onSubmit(formattedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        {/* Primary fields */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="modello"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Modello *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="es. Mercedes Vito, Fiat Ducato"
                    className="h-11 bg-muted/30 border-border"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targa"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Targa *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="es. AB123CD" 
                    className="h-11 bg-muted/30 border-border uppercase font-mono"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Secondary fields in grid */}
        <div className="grid grid-cols-3 gap-3">
          <FormField
            control={form.control}
            name="anno"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Anno</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="2020"
                    className="h-10 bg-muted/30 border-border text-center"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="colore"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Colore</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Bianco"
                    className="h-10 bg-muted/30 border-border"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="numero_posti"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Posti</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="5"
                    className="h-10 bg-muted/30 border-border text-center"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">Note</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Note aggiuntive sul veicolo..."
                  className="min-h-[80px] bg-muted/30 border-border resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status toggle - only in edit mode */}
        {isEditing && (
          <FormField
            control={form.control}
            name="attivo"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                <div>
                  <FormLabel className="text-sm font-medium">Veicolo attivo</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Disponibile per nuovi servizi
                  </p>
                </div>
                <FormControl>
                  <Switch 
                    checked={field.value} 
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {/* Actions - sticky on mobile */}
        <div className="flex gap-2 pt-4 border-t border-border sticky bottom-0 bg-background pb-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="flex-1 h-11"
          >
            Annulla
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-1 h-11"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvataggio...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Aggiorna' : 'Crea'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
