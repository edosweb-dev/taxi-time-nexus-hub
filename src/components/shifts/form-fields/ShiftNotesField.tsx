
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from "@/components/ui/textarea";
import { Control } from 'react-hook-form';
import { ShiftFormValues } from '../dialogs/ShiftFormSchema';

interface ShiftNotesFieldProps {
  control: Control<ShiftFormValues>;
}

export function ShiftNotesField({ control }: ShiftNotesFieldProps) {
  return (
    <FormField
      control={control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Note (opzionale)</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Inserisci eventuali note..." 
              className="resize-none"
              {...field}
              value={field.value || ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
