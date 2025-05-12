
import { Servizio } from "@/lib/types/servizi";

// Group services by status
export const groupServiziByStatus = (servizi: Servizio[]) => {
  return {
    da_assegnare: servizi.filter(s => s.stato === 'da_assegnare'),
    assegnato: servizi.filter(s => s.stato === 'assegnato'),
    completato: servizi.filter(s => s.stato === 'completato'),
    annullato: servizi.filter(s => s.stato === 'annullato'),
    non_accettato: servizi.filter(s => s.stato === 'non_accettato')
  };
};
