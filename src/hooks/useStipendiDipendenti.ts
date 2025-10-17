import { useQuery } from '@tanstack/react-query';
import { getStipendiDipendenti } from '@/lib/api/stipendi/getStipendiDipendenti';

export function useStipendiDipendenti(mese: number, anno: number) {
  return useQuery({
    queryKey: ['stipendi-dipendenti', mese, anno],
    queryFn: () => getStipendiDipendenti(mese, anno),
    staleTime: 1000 * 60 * 5, // 5 minuti
    retry: 1,
  });
}
