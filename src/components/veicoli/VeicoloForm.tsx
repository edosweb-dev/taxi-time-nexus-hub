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
import { Check, Loader2 } from 'lucide-react';
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
  isMobile?: boolean;
}

export function VeicoloForm({ initialData, onSubmit, onCancel, isSubmitting, isMobile }: VeicoloFormProps) {
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col h-full">
        {/* Scrollable content with inner padding */}
        <div className="flex-1 overflow-y-auto py-6">
          <div className="max-w-md mx-auto px-8 space-y-6">
            
            {/* Modello */}
            <FormField
              control={form.control}
              name="modello"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-semibold text-foreground pl-1">
                    Modello veicolo
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="es. Mercedes Vito, Fiat Ducato"
                      className="h-14 text-base px-4 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-background"
                    />
                  </FormControl>
                  <FormMessage className="pl-1" />
                </FormItem>
              )}
            />

            {/* Targa */}
            <FormField
              control={form.control}
              name="targa"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-semibold text-foreground pl-1">
                    Targa
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="AB123CD" 
                      className="h-14 text-base px-4 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-background uppercase font-mono tracking-widest text-center"
                    />
                  </FormControl>
                  <FormMessage className="pl-1" />
                </FormItem>
              )}
            />

            {/* Secondary fields */}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                Informazioni aggiuntive
              </p>
              
              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="anno"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs text-muted-foreground pl-1">Anno</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="numeric"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          placeholder="2024"
                          className="h-12 text-base px-3 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-background text-center"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="colore"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs text-muted-foreground pl-1">Colore</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Bianco"
                          className="h-12 text-base px-3 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-background"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numero_posti"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs text-muted-foreground pl-1">Posti</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="numeric"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          placeholder="5"
                          className="h-12 text-base px-3 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-background text-center"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-xs text-muted-foreground pl-1">Note</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Aggiungi note sul veicolo..."
                      rows={3}
                      className="text-base px-4 py-3 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-background resize-none"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Status toggle - only in edit mode */}
            {isEditing && (
              <FormField
                control={form.control}
                name="attivo"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-semibold text-foreground">
                        Veicolo attivo
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Disponibile per i servizi
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
          </div>
        </div>

        {/* Fixed footer */}
        <div className={cn(
          "shrink-0 border-t border-border bg-background",
          isMobile ? "px-6 py-5 pb-8" : "px-8 py-5"
        )}>
          <div className="max-w-md mx-auto flex gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onCancel}
              className="flex-1 h-14 text-base font-semibold rounded-xl bg-muted/50 hover:bg-muted"
            >
              Annulla
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-[2] h-14 text-base font-semibold rounded-xl"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  {isEditing ? 'Salva modifiche' : 'Crea veicolo'}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
