
import { Servizio, StatoServizio } from "@/lib/types/servizi";

export const groupServiziByStatus = (servizi: Servizio[]) => {
  const result: Record<StatoServizio, Servizio[]> = {
    da_assegnare: [],
    assegnato: [],
    completato: [],
    annullato: [],
    non_accettato: [],
    consuntivato: [],
  };
  
  servizi.forEach(servizio => {
    if (result[servizio.stato]) {
      result[servizio.stato].push(servizio);
    } else {
      console.warn(`Unknown servizio status: ${servizio.stato}`);
    }
  });
  
  return result;
};
