
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { SectionProps } from './types';

export function NotesSection({ form, isLoading }: SectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Note (opzionale)</h3>
      <FormField
        control={form.control}
        name="note"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Note aggiuntive</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Inserisci eventuali note..."
                className="resize-none"
                disabled={isLoading}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
