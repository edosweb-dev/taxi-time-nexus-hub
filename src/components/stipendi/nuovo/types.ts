
import { z } from 'zod';

export const stipendioSchema = z.object({
  user_id: z.string().min(1, 'Seleziona un utente'),
  km: z.number().min(12, 'Minimo 12 km').optional(),
  ore_attesa: z.number().min(0, 'Minimo 0 ore').optional(),
  ore_lavorate: z.number().min(0, 'Minimo 0 ore').optional(),
  tariffa_oraria: z.number().min(0, 'Tariffa deve essere positiva').optional(),
  note: z.string().optional(),
});

export type StipendioFormData = z.infer<typeof stipendioSchema>;

export interface SectionProps {
  form: any;
  selectedUser: any;
  selectedMonth: number;
  selectedYear: number;
  isLoading: boolean;
  configurazione: any;
}
