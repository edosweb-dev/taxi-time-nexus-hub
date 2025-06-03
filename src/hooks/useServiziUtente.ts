
import { useQuery } from '@tanstack/react-query';
import { getDatiServiziUtente } from '@/lib/api/stipendi';

export function useServiziUtente(userId: string | undefined, mese: number, anno: number) {
  return useQuery({
    queryKey: ['servizi-utente', userId, mese, anno],
    queryFn: () => getDatiServiziUtente(userId!, mese, anno),
    enabled: !!userId,
    // Cache per 5 minuti
    staleTime: 1000 * 60 * 5
  });
}
