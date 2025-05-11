
import { useQuery } from '@tanstack/react-query';
import { getServizioById } from '@/lib/api/servizi';

export function useServizio(id?: string) {
  return useQuery({
    queryKey: ['servizio', id],
    queryFn: () => getServizioById(id!),
    enabled: !!id
  });
}
