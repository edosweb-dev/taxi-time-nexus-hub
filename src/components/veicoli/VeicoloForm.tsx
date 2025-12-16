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
import { Save, Loader2, Car, Hash, Calendar, Palette, Users } from 'lucide-react';
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
        {/* Scrollable content */}
        <div className="flex-1 px-5 py-4 space-y-5">
          {/* Primary fields */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="modello"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    Modello *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="es. Mercedes Vito"
                      className="h-12 text-base bg-muted/40 border-0 focus:ring-2 focus:ring-primary/20"
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
                  <FormLabel className="text-sm font-medium flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    Targa *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="AB123CD" 
                      className="h-12 text-base bg-muted/40 border-0 focus:ring-2 focus:ring-primary/20 uppercase font-mono tracking-wider"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Secondary fields */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Dettagli opzionali
            </p>
            
            <div className="grid grid-cols-3 gap-2">
              <FormField
                control={form.control}
                name="anno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Anno
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="2024"
                        className="h-11 text-base bg-muted/40 border-0 text-center focus:ring-2 focus:ring-primary/20"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="colore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground flex items-center gap-1">
                      <Palette className="h-3 w-3" />
                      Colore
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Bianco"
                        className="h-11 text-base bg-muted/40 border-0 focus:ring-2 focus:ring-primary/20"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numero_posti"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Posti
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="5"
                        className="h-11 text-base bg-muted/40 border-0 text-center focus:ring-2 focus:ring-primary/20"
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
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Note</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Note aggiuntive..."
                    rows={3}
                    className="text-base bg-muted/40 border-0 resize-none focus:ring-2 focus:ring-primary/20"
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
                <FormItem className="flex items-center justify-between rounded-xl bg-muted/40 p-4">
                  <div>
                    <FormLabel className="text-sm font-medium">Veicolo attivo</FormLabel>
                    <p className="text-xs text-muted-foreground mt-0.5">
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
        </div>

        {/* Fixed footer */}
        <div className={cn(
          "shrink-0 px-5 py-4 border-t border-border bg-background",
          isMobile && "pb-6" // Extra padding for mobile safe area
        )}>
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="flex-1 h-12 text-base font-medium"
            >
              Annulla
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 h-12 text-base font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Salva' : 'Crea Veicolo'}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
