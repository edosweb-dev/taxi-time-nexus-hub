
import { z } from 'zod';

// Define form validation schema
export const shiftFormSchema = z.object({
  user_id: z.string({
    required_error: "Seleziona un utente"
  }),
  shift_date: z.date({
    required_error: "Seleziona una data"
  }),
  shift_type: z.enum(['specific_hours', 'full_day', 'half_day', 'sick_leave', 'unavailable'], {
    required_error: "Seleziona un tipo di turno"
  }),
  start_time: z.string().optional().nullable(),
  end_time: z.string().optional().nullable(),
  half_day_type: z.enum(['morning', 'afternoon']).optional().nullable(),
  start_date: z.date().optional().nullable(),
  end_date: z.date().optional().nullable(),
  notes: z.string().optional().nullable()
});

export type ShiftFormValues = z.infer<typeof shiftFormSchema>;
