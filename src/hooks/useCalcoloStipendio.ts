
import { useQuery } from '@tanstack/react-query';
import { calcolaStipendioCompleto, CalcoloStipendioParams, CalcoloStipendioCompleto } from '@/lib/api/stipendi/calcolaStipendio';
import { useState, useEffect } from 'react';

export interface UseCalcoloStipendioOptions {
  enableRealTime?: boolean;
  debounceMs?: number;
}

export function useCalcoloStipendio(
  params: CalcoloStipendioParams | null,
  options: UseCalcoloStipendioOptions = {}
) {
  const { enableRealTime = true, debounceMs = 500 } = options;
  const [debouncedParams, setDebouncedParams] = useState<CalcoloStipendioParams | null>(params);

  // Debounce dei parametri per evitare troppe chiamate durante la digitazione
  useEffect(() => {
    if (!enableRealTime || !params) {
      setDebouncedParams(params);
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedParams(params);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [params, enableRealTime, debounceMs]);

  const {
    data: calcoloResult,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['calcolo-stipendio', debouncedParams],
    queryFn: () => {
      if (!debouncedParams) {
        throw new Error('Parametri di calcolo mancanti');
      }
      return calcolaStipendioCompleto(debouncedParams);
    },
    enabled: !!debouncedParams && 
             !!debouncedParams.userId && 
             !!debouncedParams.mese && 
             !!debouncedParams.anno &&
             debouncedParams.km > 0,
    staleTime: enableRealTime ? 0 : 1000 * 60 * 5, // 5 minuti se non real-time
    refetchOnWindowFocus: false,
  });

  return {
    calcolo: calcoloResult,
    isLoading,
    isError,
    error,
    refetch,
    isCalculating: isLoading && enableRealTime,
  };
}

// Hook semplificato per calcoli manuali/one-shot
export function useCalcoloStipendioManuale() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastResult, setLastResult] = useState<CalcoloStipendioCompleto | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const calcola = async (params: CalcoloStipendioParams): Promise<CalcoloStipendioCompleto> => {
    setIsCalculating(true);
    setError(null);
    
    try {
      const result = await calcolaStipendioCompleto(params);
      setLastResult(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Errore durante il calcolo');
      setError(error);
      throw error;
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    calcola,
    isCalculating,
    lastResult,
    error,
    clearError: () => setError(null),
    clearResult: () => setLastResult(null),
  };
}
