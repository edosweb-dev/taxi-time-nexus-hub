
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Control } from 'react-hook-form';
import { ShiftFormValues } from '../dialogs/ShiftFormSchema';

interface HalfDayTypeFieldProps {
  control: Control<ShiftFormValues>;
}

export function HalfDayTypeField({ control }: HalfDayTypeFieldProps) {
  return (
    <FormField
      control={control}
      name="half_day_type"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Parte della giornata</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value || undefined}
              value={field.value || undefined}
              className="flex flex-col space-y-1"
            >
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="morning" />
                </FormControl>
                <FormLabel className="font-normal">
                  Mattina
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="afternoon" />
                </FormControl>
                <FormLabel className="font-normal">
                  Pomeriggio
                </FormLabel>
              </FormItem>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
