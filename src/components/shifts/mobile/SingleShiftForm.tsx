import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { supabase } from '@/integrations/supabase/client';
import { singleShiftSchema, type SingleShiftFormData } from '@/lib/schemas/shifts';
import { SHIFT_TYPE_LABELS, SHIFT_TYPE_DESCRIPTIONS, HALF_DAY_TYPE_LABELS } from '@/components/shifts/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SingleShiftFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefilledDate?: string;
  prefilledUserId?: string;
}

export function SingleShiftForm({
  open,
  onOpenChange,
  prefilledDate,
  prefilledUserId
}: SingleShiftFormProps) {
  const isMobile = useIsMobile();
  const { user: currentUser } = useAuth();
  const { users } = useUsers();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SingleShiftFormData>({
    resolver: zodResolver(singleShiftSchema),
    defaultValues: {
      user_id: prefilledUserId || '',
      shift_date: prefilledDate || format(new Date(), 'yyyy-MM-dd'),
      shift_type: 'full_day',
      half_day_type: undefined,
      notes: ''
    }
  });

  const shiftType = form.watch('shift_type');

  const onSubmit = async (data: SingleShiftFormData) => {
    if (!currentUser) {
      toast.error('Utente non autenticato');
      return;
    }

    console.log('🚀 [SingleShiftForm] Submit triggered', data);
    setIsSubmitting(true);

    try {
      const shiftData = {
        user_id: data.user_id,
        shift_date: data.shift_date,
        shift_type: data.shift_type,
        half_day_type: data.half_day_type || null,
        notes: data.notes || null,
        created_by: currentUser.id,
        updated_by: currentUser.id
      };

      console.log('🔄 [SingleShiftForm] Calling Supabase insert...', shiftData);

      const { data: result, error } = await supabase
        .from('shifts')
        .insert(shiftData)
        .select();

      if (error) throw error;

      console.log('✅ [SingleShiftForm] Success!', result);
      toast.success('Turno creato con successo!');

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['shifts'] });

      // Reset form and close
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error('❌ [SingleShiftForm] Error:', error);
      toast.error(`Errore durante la creazione: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtra solo admin, soci e dipendenti
  const employeeUsers = users?.filter(u => 
    ['admin', 'socio', 'dipendente'].includes(u.role)
  ) || [];

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 1. Dipendente */}
        <FormField
          control={form.control}
          name="user_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dipendente *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona dipendente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {employeeUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 2. Data */}
        <FormField
          control={form.control}
          name="shift_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), "PPP", { locale: it })
                      ) : (
                        <span>Seleziona data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        field.onChange(format(date, 'yyyy-MM-dd'));
                      }
                    }}
                    locale={it}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 3. Tipo Turno */}
        <FormField
          control={form.control}
          name="shift_type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo Turno *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="space-y-3"
                >
                  {(['full_day', 'half_day', 'extra', 'unavailable'] as const).map((type) => (
                    <div key={type} className="flex items-start space-x-3">
                      <RadioGroupItem value={type} id={type} className="mt-1" />
                      <Label
                        htmlFor={type}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">{SHIFT_TYPE_LABELS[type]}</div>
                        <div className="text-sm text-muted-foreground">
                          {SHIFT_TYPE_DESCRIPTIONS[type]}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 3b. Mezza Giornata - Conditional */}
        {shiftType === 'half_day' && (
          <FormField
            control={form.control}
            name="half_day_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quando? *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Mattina o Pomeriggio" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="morning">
                      {HALF_DAY_TYPE_LABELS.morning} (00:00 - 13:00)
                    </SelectItem>
                    <SelectItem value="afternoon">
                      {HALF_DAY_TYPE_LABELS.afternoon} (13:00 - 23:59)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* 4. Note */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note (opzionale)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Aggiungi note..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>Massimo 500 caratteri</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Footer Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={isSubmitting}
          >
            Annulla
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvataggio...
              </>
            ) : (
              'Salva Turno'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Nuovo Turno</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto max-h-[80vh]">
            {formContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nuovo Turno</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[70vh]">
          {formContent}
        </div>
      </DialogContent>
    </Dialog>
  );
}
