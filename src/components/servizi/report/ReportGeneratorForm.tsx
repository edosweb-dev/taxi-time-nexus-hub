
import React from 'react';
import { Form } from '@/components/ui/form';
import { useReportGeneratorForm } from '../hooks/useReportGeneratorForm';
import {
  ReportFormFilters,
  ServizioSelectionHeader,
  ServizioSelectionTable,
  FormActions
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
    selectedServizi,
    referenti,
    selectedAziendaId,
    monthOptions,
    yearOptions,
    selectedServiziCount,
    onSubmit,
    toggleSelectAll,
    toggleServizioSelection,
    aziende
  } = useReportGeneratorForm(onCancel);

  const watchAziendaId = form.watch('aziendaId');
  const watchReferenteId = form.watch('referenteId');
  const watchMonth = form.watch('month');
  const watchYear = form.watch('year');

  // Get company name and referente name for display
  const aziendaName = aziende.find(a => a.id === watchAziendaId)?.nome || '';
  const referenteName = referenti.find(u => u.id === watchReferenteId)?.first_name + ' ' + 
                        referenti.find(u => u.id === watchReferenteId)?.last_name || '';
  const monthName = monthOptions.find(m => m.value === watchMonth)?.label || '';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ReportFormFilters 
          form={form}
          aziende={aziende}
          referenti={referenti}
          selectedAziendaId={selectedAziendaId}
          monthOptions={monthOptions}
          yearOptions={yearOptions}
        />

        {/* Service selection section */}
        {watchAziendaId && watchReferenteId && watchMonth && watchYear && (
          <div className="mt-6">
            <ServizioSelectionHeader 
              aziendaName={aziendaName}
              referenteName={referenteName}
              monthName={monthName}
              year={watchYear}
              toggleSelectAll={toggleSelectAll}
            />

            <ServizioSelectionTable 
              servizi={servizi}
              selectedServizi={selectedServizi}
              toggleServizioSelection={toggleServizioSelection}
              isLoading={isLoadingServizi}
            />

            {selectedServizi.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                Servizi selezionati: {selectedServiziCount} di {selectedServizi.length}
              </div>
            )}
          </div>
        )}

        <FormActions 
          onCancel={onCancel}
          isLoading={isLoading}
          isDisabled={!watchReferenteId || selectedServiziCount === 0}
        />
      </form>
    </Form>
  );
};
