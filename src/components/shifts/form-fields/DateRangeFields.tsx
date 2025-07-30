
import { ShiftDateField } from './ShiftDateField';
import { Control } from 'react-hook-form';
import { ShiftFormValues } from '../dialogs/ShiftFormSchema';

interface DateRangeFieldsProps {
  control: Control<ShiftFormValues>;
}

export function DateRangeFields({ control }: DateRangeFieldsProps) {
  return (
    <div className="space-y-4">
      <ShiftDateField
        control={control}
        name="start_date"
        label="Data inizio"
      />
      
      <ShiftDateField
        control={control}
        name="end_date"
        label="Data fine (opzionale)"
      />
    </div>
  );
}
