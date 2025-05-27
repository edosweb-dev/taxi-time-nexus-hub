
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { SpesaDipendente, useSpeseDipendenti } from '@/hooks/useSpeseDipendenti';

const stateSchema = z.object({
  note_revisione: z.string().max(500, "Le note non possono superare i 500 caratteri").optional()
});

type StateFormData = z.infer<typeof stateSchema>;

interface SpesaStateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spesa: SpesaDipendente;
  newStatus: 'approvata' | 'non_autorizzata' | 'in_revisione';
  title: string;
  onSuccess?: () => void;
}

export function SpesaStateModal({ 
  open, 
  onOpenChange, 
  spesa, 
  newStatus, 
  title, 
  onSuccess 
}: SpesaStateModalProps) {
  const { updateSpesaStatus, isUpdatingSpesaStatus } = useSpeseDipendenti();

  const form = useForm<StateFormData>({
    resolver: zodResolver(stateSchema),
    defaultValues: {
      note_revisione: ''
    }
  });

  const onSubmit = (data: StateFormData) => {
    updateSpesaStatus({
      id: spesa.id,
      stato: newStatus,
      note_revisione: data.note_revisione
    }, {
      onSuccess: () => {
        form.reset();
        onSuccess?.();
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approvata':
        return 'text-green-600';
      case 'non_autorizzata':
        return 'text-red-600';
      case 'in_revisione':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className={getStatusColor(newStatus)}>
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Spesa:</p>
            <p className="font-medium">{spesa.causale}</p>
            <p className="text-lg font-bold text-primary mt-2">
              €{Number(spesa.importo).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="note_revisione"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note di revisione (opzionale)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Aggiungi una motivazione o nota..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isUpdatingSpesaStatus}
                >
                  Annulla
                </Button>
                <Button 
                  type="submit"
                  disabled={isUpdatingSpesaStatus}
                  className={
                    newStatus === 'approvata' ? 'bg-green-600 hover:bg-green-700' :
                    newStatus === 'non_autorizzata' ? 'bg-red-600 hover:bg-red-700' :
                    'bg-blue-600 hover:bg-blue-700'
                  }
                >
                  {isUpdatingSpesaStatus ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Conferma
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
