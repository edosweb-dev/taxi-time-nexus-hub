
import React, { useRef } from 'react';
import { Form } from '@/components/ui/form';
import { useReportGeneratorForm } from '../hooks/report';
import {
  ReportFormFilters,
  ServizioSelectionHeader,
  ServizioSelectionTable,
  FormActions,
  ReportGeneratorLoader
} from './components';

interface ReportGeneratorFormProps {
  onCancel: () => void;
}

export const ReportGeneratorForm: React.FC<ReportGeneratorFormProps> = ({ onCancel }) => {
  const {
    form,
    isLoading,
    isLoadingServizi,
    servizi,
    referenti,
    selectedAziendaId,
    monthOptions,
    yearOptions,
    onSubmit,
    aziende
  } = useReportGeneratorForm({ onCancel });

  const formRef = useRef<HTMLFormElement>(null);
  
  const watchAziendaId = form.watch('aziendaId');
  const watchReferenteId = form.watch('referenteId');
  const watchMonth = form.watch('month');
  const watchYear = form.watch('year');

  // Get company name and referente name for display
  const aziendaName = aziende.find(a => a.id === watchAziendaId)?.nome || '';
  const referenteName = referenti.find(u => u.id === watchReferenteId)?.first_name + ' ' + 
                        referenti.find(u => u.id === watchReferenteId)?.last_name || '';
  const monthName = monthOptions.find(m => m.value === watchMonth)?.label || '';
  
  const handleFormSubmit = form.handleSubmit((data) => {
    console.log("Form submitted with data:", data);
    if (formRef.current) {
      formRef.current.dataset.submitting = 'true';
    }
    onSubmit(data);
  });

  return (
    <>
      {isLoading && <ReportGeneratorLoader />}
      <Form {...form}>
        <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-6">
          <ReportFormFilters 
            form={form}
            aziende={aziende}
            referenti={referenti}
            selectedAziendaId={selectedAziendaId}
            monthOptions={monthOptions}
            yearOptions={yearOptions}
          />

          {/* Service display section */}
          {watchAziendaId && watchReferenteId && watchMonth && watchYear && (
            <div className="mt-6">
              <ServizioSelectionHeader 
                aziendaName={aziendaName}
                referenteName={referenteName}
                monthName={monthName}
                year={watchYear}
              />

              <ServizioSelectionTable 
                servizi={servizi}
                isLoading={isLoadingServizi}
              />

              {servizi.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  Servizi trovati: {servizi.length}
                </div>
              )}
            </div>
          )}

          <FormActions 
            onCancel={onCancel}
            isLoading={isLoading}
            isDisabled={!watchReferenteId || servizi.length === 0}
            serviziCount={servizi.length}
          />
        </form>
      </Form>
    </>
  );
};
