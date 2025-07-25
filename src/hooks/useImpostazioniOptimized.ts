import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getImpostazioni } from '@/lib/api/impostazioni/getImpostazioni';

// Hook ottimizzato con cache per ridurre chiamate al database
export const useImpostazioniOptimized = () => {
  const { data: impostazioni, isLoading, error } = useQuery({
    queryKey: ['impostazioni'],
    queryFn: getImpostazioni,
    staleTime: 5 * 60 * 1000, // 5 minuti di cache
    gcTime: 10 * 60 * 1000, // 10 minuti in memoria (aggiornato da cacheTime)
    refetchOnWindowFocus: false,
  });

  const metodiPagamentoMemo = useMemo(() => 
    impostazioni?.metodi_pagamento || [], 
    [impostazioni?.metodi_pagamento]
  );

  const aliquoteIvaMemo = useMemo(() => 
    impostazioni?.aliquote_iva || [], 
    [impostazioni?.aliquote_iva]
  );

  return {
    impostazioni,
    metodiPagamento: metodiPagamentoMemo,
    aliquoteIva: aliquoteIvaMemo,
    isLoading,
    error,
  };
};