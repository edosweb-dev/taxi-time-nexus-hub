import React from 'react';
import { Controller, Control } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ShiftFormValues } from '../../dialogs/ShiftFormSchema';

interface Step2ShiftTypeProps {
  control: Control<ShiftFormValues>;
  watchShiftType: string;
}

export function Step2ShiftType({ control, watchShiftType }: Step2ShiftTypeProps) {
  return (
    <div className="step-fields">
      <div className="field-group">
        <label className="field-label">Tipo Turno *</label>
        <Controller
          name="shift_type"
          control={control}
          render={({ field }) => (
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              className="mobile-radio-group"
            >
              <div className="radio-option">
                <RadioGroupItem value="specific_hours" id="specific_hours" />
                <label htmlFor="specific_hours" className="radio-label">
                  <div className="radio-content">
                    <span className="radio-title">Orario Specifico</span>
                    <span className="radio-description">Turno con orari personalizzati</span>
                  </div>
                </label>
              </div>
              
              <div className="radio-option">
                <RadioGroupItem value="full_day" id="full_day" />
                <label htmlFor="full_day" className="radio-label">
                  <div className="radio-content">
                    <span className="radio-title">Giornata Intera</span>
                    <span className="radio-description">Turno standard giornaliero</span>
                  </div>
                </label>
              </div>

              <div className="radio-option">
                <RadioGroupItem value="half_day" id="half_day" />
                <label htmlFor="half_day" className="radio-label">
                  <div className="radio-content">
                    <span className="radio-title">Mezza Giornata</span>
                    <span className="radio-description">Mattina o pomeriggio</span>
                  </div>
                </label>
              </div>

              <div className="radio-option">
                <RadioGroupItem value="sick_leave" id="sick_leave" />
                <label htmlFor="sick_leave" className="radio-label">
                  <div className="radio-content">
                    <span className="radio-title">Malattia</span>
                    <span className="radio-description">Periodo di assenza per malattia</span>
                  </div>
                </label>
              </div>

              <div className="radio-option">
                <RadioGroupItem value="unavailable" id="unavailable" />
                <label htmlFor="unavailable" className="radio-label">
                  <div className="radio-content">
                    <span className="radio-title">Non Disponibile</span>
                    <span className="radio-description">Periodo di indisponibilità</span>
                  </div>
                </label>
              </div>

              <div className="radio-option">
                <RadioGroupItem value="extra" id="extra" />
                <label htmlFor="extra" className="radio-label">
                  <div className="radio-content">
                    <span className="radio-title">Extra</span>
                    <span className="radio-description">Turno straordinario</span>
                  </div>
                </label>
              </div>
            </RadioGroup>
          )}
        />
      </div>

      {watchShiftType === 'half_day' && (
        <div className="field-group">
          <label className="field-label">Periodo *</label>
          <Controller
            name="half_day_type"
            control={control}
            render={({ field }) => (
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value || ''}
                className="flex gap-3"
              >
                <div className="radio-option-inline">
                  <RadioGroupItem value="morning" id="morning" />
                  <label htmlFor="morning" className="text-sm font-medium">Mattina</label>
                </div>
                <div className="radio-option-inline">
                  <RadioGroupItem value="afternoon" id="afternoon" />
                  <label htmlFor="afternoon" className="text-sm font-medium">Pomeriggio</label>
                </div>
              </RadioGroup>
            )}
          />
        </div>
      )}
    </div>
  );
}