
import { useFormContext } from 'react-hook-form';
import {
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
import { useAziende } from '@/hooks/useAziende';
import { ReferenteSelectField } from '../servizi/ReferenteSelectField';

interface ReportFormFieldsProps {
  watchedAziendaId: string;
  availableMonths: any[];
  isLoadingMonths: boolean;
  onAziendaChange: (value: string) => void;
  onReferenteChange: (value: string) => void;
}

export function ReportFormFields({
  watchedAziendaId,
  availableMonths,
  isLoadingMonths,
  onAziendaChange,
  onReferenteChange,
}: ReportFormFieldsProps) {
  const form = useFormContext();
  const { aziende } = useAziende();

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="azienda_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Azienda *</FormLabel>
            <Select onValueChange={onAziendaChange} value={field.value}>
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
            onValueChange={onReferenteChange}
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
    </div>
  );
}
