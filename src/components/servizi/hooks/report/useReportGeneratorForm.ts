
import { useForm } from 'react-hook-form';
import { useAziende } from '@/hooks/useAziende';
import { ReportFormValues, UseReportGeneratorFormProps, UseReportGeneratorFormReturn } from './types';
import { useServizi } from './useServizi';
import { useReferenti } from './useReferenti';
import { useReportFormSubmit } from './useReportFormSubmit';
import { monthOptions, getYearOptions, getDefaultValues } from './constants';

export const useReportGeneratorForm = ({ onCancel }: UseReportGeneratorFormProps): UseReportGeneratorFormReturn => {
  const { aziende } = useAziende();
  
  const form = useForm<ReportFormValues>({
    defaultValues: getDefaultValues()
  });

  const watchAziendaId = form.watch('aziendaId');
  const watchReferenteId = form.watch('referenteId');
  const watchMonth = form.watch('month');
  const watchYear = form.watch('year');
  
  // Use the custom hooks
  const { referenti, selectedAziendaId } = useReferenti(watchAziendaId);
  const { servizi, isLoadingServizi } = useServizi(
    watchAziendaId, 
    watchReferenteId,
    watchMonth,
    watchYear
  );
  const { isLoading, handleSubmit } = useReportFormSubmit(servizi, onCancel);

  // When azienda changes, reset referente selection
  if (watchAziendaId) {
    form.setValue('referenteId', '');
  }

  const yearOptions = getYearOptions();

  const onSubmit = (data: ReportFormValues) => {
    return handleSubmit(data);
  };

  return {
    form,
    isLoading,
    isLoadingServizi,
    servizi,
    referenti,
    selectedAziendaId,
    monthOptions,
    yearOptions,
    onSubmit,
    aziende,
  };
};
