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
import { useCreateConducenteEsterno, useUpdateConducenteEsterno } from '@/hooks/useConducentiEsterni';
import { ConducenteEsterno } from '@/lib/types/conducenti-esterni';
import { User, Mail, Phone, Settings, Save, X } from 'lucide-react';

const conducenteEsternoSchema = z.object({
  nome_cognome: z.string().min(1, 'Nome e cognome obbligatorio'),
  email: z.string().email('Email non valida').optional().or(z.literal('')),
  telefono: z.string().optional(),
  note: z.string().optional(),
  attivo: z.boolean().default(true),
});

type ConducenteEsternoFormData = z.infer<typeof conducenteEsternoSchema>;

interface ConducenteEsternoFormProps {
  conducente?: ConducenteEsterno | null;
  mode: 'create' | 'edit';
  onSuccess: () => void;
  onCancel: () => void;
}

export function ConducenteEsternoForm({
  conducente,
  mode,
  onSuccess,
  onCancel
}: ConducenteEsternoFormProps) {
  const isEditing = mode === 'edit';
  const createMutation = useCreateConducenteEsterno();
  const updateMutation = useUpdateConducenteEsterno();

  const form = useForm<ConducenteEsternoFormData>({
    resolver: zodResolver(conducenteEsternoSchema),
    defaultValues: {
      nome_cognome: conducente?.nome_cognome || '',
      email: conducente?.email || '',
      telefono: conducente?.telefono || '',
      note: conducente?.note || '',
      attivo: conducente?.attivo ?? true,
    }
  });

  const onSubmit = async (data: ConducenteEsternoFormData) => {
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync({
          nome_cognome: data.nome_cognome,
          email: data.email || undefined,
          telefono: data.telefono || undefined,
          note: data.note || undefined,
        });
      } else if (conducente) {
        await updateMutation.mutateAsync({
          id: conducente.id,
          nome_cognome: data.nome_cognome,
          email: data.email || undefined,
          telefono: data.telefono || undefined,
          note: data.note || undefined,
          attivo: data.attivo,
        });
      }
      onSuccess();
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Main Information Card */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-4">
            <CardTitle className="card-title flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informazioni Principali
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="nome_cognome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome e Cognome *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Mario Rossi" className="h-11 px-4" autoCapitalize="words" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Contact Information Card */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-4">
            <CardTitle className="card-title flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              Informazioni di Contatto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="mario.rossi@email.com" className="h-11 px-4" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Telefono
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" placeholder="+39 123 456 7890" className="h-11 px-4" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note aggiuntive</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Note aggiuntive sul conducente..." rows={3} />
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
                      <FormLabel className="text-base">Conducente attivo</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        I conducenti disattivati non saranno disponibili per l'assegnazione ai servizi
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} className="h-8 w-14" />
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
            className="h-11 px-4 flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Annulla
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="h-11 px-4 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Salvataggio...' : isEditing ? 'Aggiorna Conducente' : 'Crea Conducente'}
          </Button>
        </div>
      </form>
    </Form>
  );
}