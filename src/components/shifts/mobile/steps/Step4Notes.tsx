import React from 'react';
import { Controller, Control } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { ShiftFormValues } from '../../dialogs/ShiftFormSchema';

interface Step4NotesProps {
  control: Control<ShiftFormValues>;
}

export function Step4Notes({ control }: Step4NotesProps) {
  return (
    <div className="step-fields">
      <div className="field-group">
        <label className="field-label">Note (opzionale)</label>
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              value={field.value || ''}
              placeholder="Aggiungi note o istruzioni speciali..."
              className="mobile-textarea"
              rows={3}
            />
          )}
        />
      </div>

      <div className="info-message">
        <p>Le note saranno visibili a tutti gli utenti che possono vedere questo turno.</p>
      </div>
    </div>
  );
}