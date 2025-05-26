
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useReports, useAvailableMonths } from '@/hooks/useReports';
import { Eye, Loader2 } from 'lucide-react';
import { CreateReportData } from '@/lib/types/reports';
import { ReportFormFields } from './ReportFormFields';

const reportSchema = z.object({
  azienda_id: z.string().min(1, 'Seleziona un\'azienda'),
  referente_id: z.string().optional(),
  tipo_report: z.enum(['servizi', 'finanziario', 'veicoli'], {
    required_error: 'Seleziona un tipo di report',
  }),
  month_year: z.string().min(1, 'Seleziona un mese'),
});

type ReportFormData = z.infer<typeof reportSchema>;

interface ReportFormProps {
  onPreview: (data: { 
    aziendaId: string; 
    referenteId?: string; 
    tipoReport: 'servizi' | 'finanziario' | 'veicoli'; 
    year: number; 
    month: number;
  }) => void;
  onResetPreview: () => void;
}

export function ReportForm({ onPreview, onResetPreview }: ReportFormProps) {
  const { generateReport, isGenerating } = useReports();

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

  const handleAziendaChange = (value: string) => {
    form.setValue('azienda_id', value);
    form.setValue('referente_id', '');
    form.setValue('month_year', '');
    onResetPreview();
  };

  const handleReferenteChange = (value: string) => {
    form.setValue('referente_id', value);
    form.setValue('month_year', '');
    onResetPreview();
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
    onResetPreview();
  };

  const handlePreview = async (data: ReportFormData) => {
    const [year, month] = data.month_year.split('-').map(Number);
    
    onPreview({
      aziendaId: data.azienda_id,
      referenteId: data.referente_id,
      tipoReport: data.tipo_report,
      year,
      month
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ReportFormFields
          watchedAziendaId={watchedAziendaId}
          availableMonths={availableMonths}
          isLoadingMonths={isLoadingMonths}
          onAziendaChange={handleAziendaChange}
          onReferenteChange={handleReferenteChange}
        />

        <div className="flex gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={form.handleSubmit(handlePreview)} 
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
  );
}
