
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Control, UseFormSetValue } from 'react-hook-form';
import { ShiftFormValues } from '../dialogs/ShiftFormSchema';

interface ShiftTypeSelectProps {
  control: Control<ShiftFormValues>;
  setValue: UseFormSetValue<ShiftFormValues>;
}

export function ShiftTypeSelect({ control, setValue }: ShiftTypeSelectProps) {
  return (
    <FormField
      control={control}
      name="shift_type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tipo di turno</FormLabel>
          <Select
            value={field.value}
            onValueChange={(value) => {
              field.onChange(value);
              // Reset conditional fields
              if (value !== 'specific_hours') {
                setValue('start_time', null);
                setValue('end_time', null);
              }
              if (value !== 'half_day') {
                setValue('half_day_type', null);
              }
              if (!['sick_leave', 'unavailable'].includes(value)) {
                setValue('start_date', null);
                setValue('end_date', null);
              }
            }}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona un tipo di turno" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="specific_hours">Orario specifico</SelectItem>
              <SelectItem value="full_day">Giornata intera</SelectItem>
              <SelectItem value="half_day">Mezza giornata</SelectItem>
              <SelectItem value="sick_leave">Malattia</SelectItem>
              <SelectItem value="unavailable">Non disponibile</SelectItem>
              <SelectItem value="extra">Extra</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
