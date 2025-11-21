import { z } from 'zod';

/**
 * Schema per inserimento singolo turno
 */
export const singleShiftSchema = z.object({
  user_id: z.string({
    required_error: 'Seleziona un dipendente'
  }).min(1, 'Seleziona un dipendente'),
  
  shift_date: z.string({
    required_error: 'Seleziona una data'
  }).regex(/^\d{4}-\d{2}-\d{2}$/, 'Data non valida'),
  
  shift_type: z.enum(['full_day', 'half_day', 'extra', 'unavailable'], {
    required_error: 'Seleziona un tipo di turno'
  }),
  
  half_day_type: z.enum(['morning', 'afternoon']).optional(),
  
  notes: z.string()
    .max(500, 'Le note non possono superare i 500 caratteri')
    .optional()
    .transform(val => val === '' ? undefined : val)
}).refine(
  (data) => {
    // Se shift_type è 'half_day', half_day_type è obbligatorio
    if (data.shift_type === 'half_day') {
      return data.half_day_type !== undefined;
    }
    return true;
  },
  {
    message: 'Seleziona il periodo (mattina o pomeriggio)',
    path: ['half_day_type']
  }
);

export type SingleShiftFormData = z.infer<typeof singleShiftSchema>;

/**
 * Schema per inserimento massivo turni (wizard multi-step)
 */
export const batchShiftSchema = z.object({
  user_ids: z.array(z.string()).min(1, 'Seleziona almeno un dipendente'),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  period_type: z.enum(['full_month', 'single_week', 'multiple_weeks']),
  week: z.number().min(1).max(5).optional(),
  weeks: z.array(z.number().min(1).max(5)).optional(),
  weekdays: z.array(z.number().min(0).max(6)).min(1, 'Seleziona almeno un giorno'),
  shift_type: z.enum(['full_day', 'half_day', 'extra', 'unavailable']),
  half_day_type: z.enum(['morning', 'afternoon']).optional(),
  notes: z.string().max(500).optional()
});

export type BatchShiftFormData = z.infer<typeof batchShiftSchema>;

/**
 * Schema per inserimento rapido turni singolo utente
 */
export const singleUserBatchShiftSchema = z.object({
  user_id: z.string().min(1, 'Seleziona un dipendente'),
  selected_dates: z.array(z.string()).min(1, 'Seleziona almeno una data'),
  shift_type: z.enum(['full_day', 'half_day', 'extra', 'unavailable']),
  half_day_type: z.enum(['morning', 'afternoon']).optional(),
  notes: z.string().max(500).optional()
}).refine(
  (data) => {
    // Se shift_type è 'half_day', half_day_type è obbligatorio
    if (data.shift_type === 'half_day') {
      return data.half_day_type !== undefined;
    }
    return true;
  },
  {
    message: 'Seleziona il periodo (mattina o pomeriggio)',
    path: ['half_day_type']
  }
);

export type SingleUserBatchShiftFormData = z.infer<typeof singleUserBatchShiftSchema>;
