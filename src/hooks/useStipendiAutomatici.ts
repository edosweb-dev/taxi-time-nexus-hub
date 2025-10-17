import { useQuery } from '@tanstack/react-query';
import { getStipendiAutomaticiMese, StipendiAutomaticoUtente } from '@/lib/api/stipendi/calcoloAutomaticoStipendi';

export function useStipendiAutomatici(mese: number, anno: number) {
  return useQuery({
    queryKey: ['stipendi-automatici', mese, anno],
    queryFn: () => getStipendiAutomaticiMese(mese, anno),
    staleTime: 1000 * 60 * 5, // 5 minuti
    retry: 1,
  });
}
