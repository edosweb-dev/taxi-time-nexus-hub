
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Clock } from 'lucide-react';
import { Control } from 'react-hook-form';
import { ShiftFormValues } from '../dialogs/ShiftFormSchema';

interface ShiftTimeFieldsProps {
  control: Control<ShiftFormValues>;
}

export function ShiftTimeFields({ control }: ShiftTimeFieldsProps) {
  return (
    <div className="flex gap-4">
      <FormField
        control={control}
        name="start_time"
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel>Orario inizio</FormLabel>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <FormControl>
                <input
                  type="time"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="end_time"
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel>Orario fine</FormLabel>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <FormControl>
                <input
                  type="time"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
