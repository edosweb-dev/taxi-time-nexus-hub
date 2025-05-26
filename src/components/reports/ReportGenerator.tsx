
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useReports } from '@/hooks/useReports';
import { useAziende } from '@/hooks/useAziende';
import { FileText, Loader2 } from 'lucide-react';

const reportSchema = z.object({
  azienda_id: z.string().min(1, 'Seleziona un\'azienda'),
  tipo_report: z.enum(['servizi', 'finanziario', 'veicoli'], {
    required_error: 'Seleziona un tipo di report',
  }),
  data_inizio: z.string().min(1, 'Inserisci la data di inizio'),
  data_fine: z.string().min(1, 'Inserisci la data di fine'),
}).refine((data) => {
  if (data.data_inizio && data.data_fine) {
    return new Date(data.data_inizio) <= new Date(data.data_fine);
  }
  return true;
}, {
  message: 'La data di fine deve essere successiva alla data di inizio',
  path: ['data_fine'],
});

type ReportFormData = z.infer<typeof reportSchema>;

export function ReportGenerator() {
  const { generateReport, isGenerating } = useReports();
  const { aziende } = useAziende();

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      azienda_id: '',
      tipo_report: 'servizi',
      data_inizio: '',
      data_fine: '',
    },
  });

  const onSubmit = async (data: ReportFormData) => {
    generateReport(data);
    form.reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Genera Nuovo Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="azienda_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Azienda *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona un'azienda" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {aziende.map((azienda) => (
                        <SelectItem key={azienda.id} value={azienda.id}>
                          {azienda.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipo_report"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo Report *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona il tipo di report" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="servizi">Report Servizi</SelectItem>
                      <SelectItem value="finanziario">Report Finanziario</SelectItem>
                      <SelectItem value="veicoli">Report Veicoli</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="data_inizio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Inizio *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_fine"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Fine *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isGenerating} className="w-full">
              {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Genera Report
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
