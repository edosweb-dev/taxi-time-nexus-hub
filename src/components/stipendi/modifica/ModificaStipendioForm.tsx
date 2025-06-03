
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { Stipendio } from '@/lib/api/stipendi';

const formSchema = z.object({
  km: z.number().min(0, 'I KM devono essere un numero positivo').optional(),
  ore_attesa: z.number().min(0, 'Le ore di attesa devono essere un numero positivo').optional(),
  ore_lavorate: z.number().min(0, 'Le ore lavorate devono essere un numero positivo').optional(),
  tariffa_oraria: z.number().min(0, 'La tariffa oraria deve essere un numero positivo').optional(),
  note: z.string().optional(),
});

export type FormData = z.infer<typeof formSchema>;

interface ModificaStipendioFormProps {
  stipendio: Stipendio;
  canModify: boolean;
  defaultValues: FormData;
  onSubmit: (data: FormData) => Promise<void>;
  isPending: boolean;
  onCancel: () => void;
  onFormChange: (values: FormData) => void;
}

export function ModificaStipendioForm({
  stipendio,
  canModify,
  defaultValues,
  onSubmit,
  isPending,
  onCancel,
  onFormChange
}: ModificaStipendioFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const watchedValues = form.watch();

  // Notify parent of form changes
  React.useEffect(() => {
    onFormChange(watchedValues);
  }, [watchedValues, onFormChange]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Parametri Calcolo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stipendio.tipo_calcolo === 'socio' ? (
              <>
                <FormField
                  control={form.control}
                  name="km"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chilometri percorsi</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          placeholder="Inserisci i km"
                          disabled={!canModify}
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ore_attesa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ore di attesa</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="Inserisci le ore di attesa"
                          disabled={!canModify}
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="ore_lavorate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ore lavorate</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="Inserisci le ore lavorate"
                          disabled={!canModify}
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tariffa_oraria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tariffa oraria (€)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Inserisci la tariffa oraria"
                          disabled={!canModify}
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Note aggiuntive..."
                      disabled={!canModify}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Annulla
          </Button>
          
          {canModify && (
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1"
            >
              {isPending ? 'Salvando...' : 'Salva Modifiche'}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
