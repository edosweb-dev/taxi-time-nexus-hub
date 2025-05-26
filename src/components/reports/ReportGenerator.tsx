
import { useState } from 'react';
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
import { FileText, Loader2, Eye } from 'lucide-react';
import { CreateReportData } from '@/lib/types/reports';
import { ReportPreviewTable } from './ReportPreviewTable';
import { ReferenteSelectField } from '../servizi/ReferenteSelectField';

const reportSchema = z.object({
  azienda_id: z.string().min(1, 'Seleziona un\'azienda'),
  referente_id: z.string().optional(),
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
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<ReportFormData | null>(null);

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      azienda_id: '',
      referente_id: '',
      tipo_report: 'servizi',
      data_inizio: '',
      data_fine: '',
    },
  });

  const watchedAziendaId = form.watch('azienda_id');

  // Reset referente when azienda changes
  const handleAziendaChange = (value: string) => {
    form.setValue('azienda_id', value);
    form.setValue('referente_id', '');
  };

  const onSubmit = async (data: ReportFormData) => {
    const reportData: CreateReportData = {
      azienda_id: data.azienda_id,
      tipo_report: data.tipo_report,
      data_inizio: data.data_inizio,
      data_fine: data.data_fine,
      referente_id: data.referente_id,
    };
    
    generateReport(reportData);
    form.reset();
    setShowPreview(false);
    setPreviewData(null);
  };

  const onPreview = async (data: ReportFormData) => {
    setPreviewData(data);
    setShowPreview(true);
  };

  return (
    <div className="space-y-6 w-full">
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
                    <Select onValueChange={handleAziendaChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona un'azienda" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {aziende.filter(azienda => azienda.id && azienda.id.trim() !== '').map((azienda) => (
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

              {watchedAziendaId && (
                <ReferenteSelectField aziendaId={watchedAziendaId} />
              )}

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

              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={form.handleSubmit(onPreview)} 
                  className="flex-1"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Anteprima
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={isGenerating} 
                  className="flex-1"
                >
                  {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Genera Report
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {showPreview && previewData && (
        <div className="w-full">
          <ReportPreviewTable 
            aziendaId={previewData.azienda_id}
            referenteId={previewData.referente_id}
            tipoReport={previewData.tipo_report}
            dataInizio={previewData.data_inizio}
            dataFine={previewData.data_fine}
          />
        </div>
      )}
    </div>
  );
}
