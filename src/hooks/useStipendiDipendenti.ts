import { useQuery } from '@tanstack/react-query';
import { getStipendiDipendenti } from '@/lib/api/stipendi/getStipendiDipendenti';

export function useStipendiDipendenti(mese: number, anno: number) {
  return useQuery({
    queryKey: ['stipendi-dipendenti', mese, anno],
    queryFn: () => getStipendiDipendenti(mese, anno),
    staleTime: 2 * 60 * 1000, // 2 minuti
    gcTime: 5 * 60 * 1000,    // 5 minuti
    retry: 1,
  });
}
