
import { useForm } from 'react-hook-form';
import { useAziende } from '@/hooks/useAziende';
import { ReportFormValues, UseReportGeneratorFormProps, UseReportGeneratorFormReturn } from './types';
import { useServizi } from './useServizi';
import { useReferenti } from './useReferenti';
import { useReportFormSubmit } from './useReportFormSubmit';
import { monthOptions, getYearOptions, getDefaultValues } from './constants';
import { useEffect } from 'react';

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

  // Reset referente when azienda changes - using useEffect to avoid render loop
  useEffect(() => {
    // Only reset if there's a watchAziendaId and the current referenteId doesn't belong to this azienda
    if (watchAziendaId) {
      // Get current referenteId value
      const currentReferenteId = form.getValues('referenteId');
      // Only reset if there's a value and that referente isn't in the current list of referenti
      if (currentReferenteId && 
          !referenti.some(ref => ref.id === currentReferenteId)) {
        form.setValue('referenteId', '');
      }
    }
  }, [watchAziendaId, form, referenti]);

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

