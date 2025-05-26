
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
import { useReports, useAvailableMonths } from '@/hooks/useReports';
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
  month_year: z.string().min(1, 'Seleziona un mese'),
});

type ReportFormData = z.infer<typeof reportSchema>;

export function ReportGenerator() {
  const { generateReport, isGenerating } = useReports();
  const { aziende } = useAziende();
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<{ 
    aziendaId: string; 
    referenteId?: string; 
    tipoReport: 'servizi' | 'finanziario' | 'veicoli'; 
    year: number; 
    month: number;
  } | null>(null);

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      azienda_id: '',
      referente_id: '',
      tipo_report: 'servizi',
      month_year: '',
    },
  });

  const watchedAziendaId = form.watch('azienda_id');
  const watchedReferenteId = form.watch('referente_id');

  const { data: availableMonths = [], isLoading: isLoadingMonths } = useAvailableMonths(
    watchedAziendaId,
    watchedReferenteId
  );

  // Reset referente when azienda changes
  const handleAziendaChange = (value: string) => {
    form.setValue('azienda_id', value);
    form.setValue('referente_id', '');
    form.setValue('month_year', '');
    setShowPreview(false);
    setPreviewData(null);
  };

  // Reset month when referente changes
  const handleReferenteChange = (value: string) => {
    form.setValue('referente_id', value);
    form.setValue('month_year', '');
    setShowPreview(false);
    setPreviewData(null);
  };

  const onSubmit = async (data: ReportFormData) => {
    const [year, month] = data.month_year.split('-').map(Number);
    const dataInizio = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const dataFine = new Date(year, month, 0).toISOString().split('T')[0];

    const reportData: CreateReportData = {
      azienda_id: data.azienda_id,
      tipo_report: data.tipo_report,
      data_inizio: dataInizio,
      data_fine: dataFine,
      referente_id: data.referente_id,
    };
    
    generateReport(reportData);
    form.reset();
    setShowPreview(false);
    setPreviewData(null);
  };

  const onPreview = async (data: ReportFormData) => {
    const [year, month] = data.month_year.split('-').map(Number);
    
    setPreviewData({
      aziendaId: data.azienda_id,
      referenteId: data.referente_id,
      tipoReport: data.tipo_report,
      year,
      month
    });
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
                <div className="space-y-4">
                  <ReferenteSelectField 
                    aziendaId={watchedAziendaId} 
                    onValueChange={handleReferenteChange}
                  />

                  <FormField
                    control={form.control}
                    name="month_year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mese di Riferimento *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={
                                isLoadingMonths 
                                  ? "Caricamento..." 
                                  : availableMonths.length === 0 
                                    ? "Nessun mese disponibile"
                                    : "Seleziona un mese"
                              } />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableMonths.map((monthData) => (
                              <SelectItem 
                                key={`${monthData.year}-${monthData.month}`} 
                                value={`${monthData.year}-${monthData.month}`}
                              >
                                {monthData.monthName} ({monthData.servicesCount} servizi)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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

              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={form.handleSubmit(onPreview)} 
                  className="flex-1"
                  disabled={!watchedAziendaId || availableMonths.length === 0}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Anteprima
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={isGenerating || !watchedAziendaId || availableMonths.length === 0} 
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
            aziendaId={previewData.aziendaId}
            referenteId={previewData.referenteId}
            tipoReport={previewData.tipoReport}
            year={previewData.year}
            month={previewData.month}
          />
        </div>
      )}
    </div>
  );
}
