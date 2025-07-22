
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VeicoloFormData } from '@/lib/types/veicoli';
import { Car, Info, Settings, Save, X, Calendar, Palette, Users } from 'lucide-react';

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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Main Information Card */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-4">
            <CardTitle className="card-title flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              Informazioni Principali
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="modello"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modello *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="es. Fiat 500, Mercedes Vito" />
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
                    <FormLabel>Targa *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="es. AB123CD" style={{ textTransform: 'uppercase' }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Details Card */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-4">
            <CardTitle className="card-title flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Dettagli Veicolo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="anno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Anno
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="es. 2020"
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
                    <FormLabel className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Colore
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="es. Bianco, Nero" />
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
                    <FormLabel className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Numero posti
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="es. 5"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-4">
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note aggiuntive</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Note aggiuntive sul veicolo" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Settings Card */}
        {isEditing && (
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-4">
              <CardTitle className="card-title flex items-center gap-2">
                <Settings className="h-5 w-5 text-amber-500" />
                Configurazioni
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="attivo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Veicolo attivo</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        I veicoli disattivati non saranno disponibili per nuovi servizi
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Annulla
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Salvataggio...' : isEditing ? 'Aggiorna Veicolo' : 'Crea Veicolo'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
