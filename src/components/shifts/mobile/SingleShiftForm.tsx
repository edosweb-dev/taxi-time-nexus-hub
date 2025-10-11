import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { useIsMobile } from '@/hooks/useIsMobile';
import { singleShiftSchema, type SingleShiftFormData } from '@/lib/schemas/shifts';
import { SHIFT_TYPE_LABELS, SHIFT_TYPE_DESCRIPTIONS, HALF_DAY_TYPE_LABELS } from '@/components/shifts/types';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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

  // Filtra solo dipendenti, soci e admin
  const availableUsers = users?.filter(u => 
    ['admin', 'socio', 'dipendente'].includes(u.role)
  ) || [];

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

  const selectedShiftType = form.watch('shift_type');

  // Reset half_day_type quando shift_type cambia
  React.useEffect(() => {
    if (selectedShiftType !== 'half_day') {
      form.setValue('half_day_type', undefined);
    }
  }, [selectedShiftType, form]);

  const onSubmit = async (data: SingleShiftFormData) => {
    if (!currentUser) {
      toast.error('Devi essere autenticato');
      return;
    }

    console.log('🚀 [SingleShiftForm] Submit triggered!', data);
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

      console.log('🔄 [SingleShiftForm] Calling Supabase API...', shiftData);

      const { data: result, error } = await supabase
        .from('shifts')
        .insert(shiftData)
        .select()
        .single();

      if (error) {
        console.error('❌ [SingleShiftForm] Supabase error:', error);
        throw error;
      }

      console.log('✅ [SingleShiftForm] Success!', result);

      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ['shifts'] });

      toast.success('Turno creato con successo!');
      
      // Reset form e chiudi
      form.reset();
      onOpenChange(false);

    } catch (error: any) {
      console.error('❌ [SingleShiftForm] Error:', error);
      toast.error(`Errore: ${error.message || 'Impossibile creare il turno'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 1. DIPENDENTE */}
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
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: user.color || '#6b7280' }}
                        />
                        <span>{user.first_name} {user.last_name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 2. DATA */}
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
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), 'PPP', { locale: it })
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

        {/* 3. TIPO TURNO */}
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
                    <div
                      key={type}
                      className={cn(
                        'flex items-start space-x-3 space-y-0 rounded-lg border p-4',
                        'cursor-pointer transition-all hover:bg-accent',
                        field.value === type && 'border-primary bg-accent'
                      )}
                      onClick={() => field.onChange(type)}
                    >
                      <RadioGroupItem value={type} id={type} className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor={type} className="cursor-pointer font-medium">
                          {SHIFT_TYPE_LABELS[type]}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {SHIFT_TYPE_DESCRIPTIONS[type]}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 3b. MATTINA/POMERIGGIO (conditional) */}
        {selectedShiftType === 'half_day' && (
          <FormField
            control={form.control}
            name="half_day_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Periodo *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona periodo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="morning">
                      {HALF_DAY_TYPE_LABELS.morning}
                    </SelectItem>
                    <SelectItem value="afternoon">
                      {HALF_DAY_TYPE_LABELS.afternoon}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Mattina: 00:00-13:00 | Pomeriggio: 13:00-23:59
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* 4. NOTE */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note (opzionale)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Aggiungi note al turno..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Massimo 500 caratteri
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* FOOTER BUTTONS */}
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
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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

  // Mobile: Drawer
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Nuovo Turno</DrawerTitle>
            <DrawerDescription>
              Crea un turno per un dipendente
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto">
            {formContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuovo Turno</DialogTitle>
          <DialogDescription>
            Crea un turno per un dipendente
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
