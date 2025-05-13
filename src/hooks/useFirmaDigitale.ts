
import { useQuery } from '@tanstack/react-query';
import { checkFirmaDigitaleAttiva, uploadFirma } from '@/lib/api/servizi/gestioneFirmaDigitale';
import { useAuth } from '@/contexts/AuthContext';

export function useFirmaDigitale() {
  const { profile } = useAuth();
  const aziendaId = profile?.azienda_id;

  const { data, isLoading } = useQuery({
    queryKey: ['firmaDigitaleAttiva', aziendaId],
    queryFn: () => aziendaId ? checkFirmaDigitaleAttiva(aziendaId) : Promise.resolve(false),
    enabled: !!aziendaId,
  });

  return {
    isFirmaDigitaleAttiva: data || false,
    isLoading,
    uploadFirma
  };
}
