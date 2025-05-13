
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ReportFormFiltersProps {
  form: any;
  aziende: any[];
  referenti: any[];
  selectedAziendaId: string;
  monthOptions: { value: string; label: string }[];
  yearOptions: { value: string; label: string }[];
}

export const ReportFormFilters: React.FC<ReportFormFiltersProps> = ({
  form,
  aziende,
  referenti,
  selectedAziendaId,
  monthOptions,
  yearOptions
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Company selection */}
      <FormField
        control={form.control}
        name="aziendaId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Azienda</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona l'azienda" />
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

      {/* Referente selection */}
      <FormField
        control={form.control}
        name="referenteId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Referente</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={!selectedAziendaId}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona il referente" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {referenti.map((referente) => (
                  <SelectItem key={referente.id} value={referente.id}>
                    {referente.first_name} {referente.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Month selection */}
      <FormField
        control={form.control}
        name="month"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mese</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona il mese" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {monthOptions.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Year selection */}
      <FormField
        control={form.control}
        name="year"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Anno</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona l'anno" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
