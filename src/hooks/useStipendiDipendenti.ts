import { useQuery } from '@tanstack/react-query';
import { getStipendiDipendenti } from '@/lib/api/stipendi/getStipendiDipendenti';

export function useStipendiDipendenti(mese: number, anno: number) {
  console.log(`[useStipendiDipendenti] Hook chiamato con mese=${mese}, anno=${anno}`);
  
  return useQuery({
    queryKey: ['stipendi-dipendenti', mese, anno],
    queryFn: () => {
      console.log(`[useStipendiDipendenti] Esecuzione queryFn`);
      return getStipendiDipendenti(mese, anno);
    },
    staleTime: 0,  // Temporaneo per debug - forza refresh
    gcTime: 0,     // Temporaneo per debug
    retry: 1,
  });
}
