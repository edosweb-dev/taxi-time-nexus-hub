import React from 'react';
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, FileText } from 'lucide-react';

const SHIFT_TYPES = [
  { 
    value: 'full_day', 
    label: 'Giornata intera', 
    description: 'Turno di lavoro completo' 
  },
  { 
    value: 'half_day', 
    label: 'Mezza giornata', 
    description: 'Mattina o pomeriggio' 
  },
  { 
    value: 'specific_hours', 
    label: 'Orario specifico', 
    description: 'Definisci orari precisi' 
  }
];

const HALF_DAY_TYPES = [
  { value: 'morning', label: 'Mattina' },
  { value: 'afternoon', label: 'Pomeriggio' }
];

interface BatchStep3ShiftTypeProps {
  control: Control<any>;
  watchShiftType: string;
}

export function BatchStep3ShiftType({ control, watchShiftType }: BatchStep3ShiftTypeProps) {
  return (
    <div className="space-y-4">
      {/* Shift Type Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Tipo di turno
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={control}
            name="shiftType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid gap-3"
                  >
                    {SHIFT_TYPES.map((type) => (
                      <FormItem
                        key={type.value}
                        className="flex items-start space-x-3 space-y-0 p-3 border rounded-lg"
                      >
                        <FormControl>
                          <RadioGroupItem value={type.value} className="mt-1" />
                        </FormControl>
                        <div className="flex-1">
                          <FormLabel className="font-medium">
                            {type.label}
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            {type.description}
                          </p>
                        </div>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Specific Hours Fields */}
      {watchShiftType === 'specific_hours' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Orari</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ora inizio</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ora fine</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Half Day Type */}
      {watchShiftType === 'half_day' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Parte della giornata</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={control}
              name="halfDayType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-6"
                    >
                      {HALF_DAY_TYPES.map((type) => (
                        <FormItem
                          key={type.value}
                          className="flex items-center space-x-3 space-y-0"
                        >
                          <FormControl>
                            <RadioGroupItem value={type.value} />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {type.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Note (opzionale)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Aggiungi note per questi turni..."
                    className="resize-none"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}