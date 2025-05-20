
export interface ReportFormValues {
  aziendaId: string;
  referenteId: string;
  month: string;
  year: string;
}

export interface UseReportGeneratorFormProps {
  onCancel: () => void;
}

export interface UseReportGeneratorFormReturn {
  form: any; // ReturnType from react-hook-form
  isLoading: boolean;
  isLoadingServizi: boolean;
  servizi: any[];
  referenti: any[];
  selectedAziendaId: string;
  monthOptions: { value: string; label: string }[];
  yearOptions: { value: string; label: string }[];
  onSubmit: (data: ReportFormValues) => Promise<void>;
  aziende: any[];
}
