
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { ShiftFormValues } from '../dialogs/ShiftFormSchema';
import { DatePickerField } from '@/components/ui/date-picker-field';

interface ShiftDateFieldProps {
  control: Control<ShiftFormValues>;
  name: "shift_date" | "start_date" | "end_date";
  label: string;
  placeholder?: string;
}

export function ShiftDateField({ control, name, label, placeholder = "Seleziona una data" }: ShiftDateFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <DatePickerField
              value={field.value || undefined}
              onChange={field.onChange}
              placeholder={placeholder}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
