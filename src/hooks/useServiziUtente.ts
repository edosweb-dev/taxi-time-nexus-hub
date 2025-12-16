
import { useQuery } from '@tanstack/react-query';
import { getDatiServiziUtente } from '@/lib/api/stipendi';

export function useServiziUtente(userId: string | undefined, mese: number, anno: number) {
  return useQuery({
    queryKey: ['servizi-utente', userId, mese, anno],
    queryFn: () => getDatiServiziUtente(userId!, mese, anno),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minuti - dati operativi
  });
}
