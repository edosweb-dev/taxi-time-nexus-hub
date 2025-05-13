
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { useQueryClient } from '@tanstack/react-query';
import { salvaFirmaDigitale } from '@/lib/api/servizi/gestioneFirmaDigitale';

export function useFirmaDigitale() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const uploadFirma = async (servizioId: string, firmaBase64: string) => {
    try {
      setIsLoading(true);
      
      const result = await salvaFirmaDigitale(servizioId, firmaBase64);
      
      if (!result.success) {
        throw result.error;
      }
      
      // Invalida le query per aggiornare i dati
      queryClient.invalidateQueries({ queryKey: ['servizio', servizioId] });
      queryClient.invalidateQueries({ queryKey: ['servizi'] });
      
      toast.success("Firma salvata con successo");
      return { success: true, url: result.url, timestamp: result.timestamp };
      
    } catch (error: any) {
      console.error('Errore nel salvataggio della firma:', error);
      toast.error(`Errore nel salvataggio della firma: ${error.message || 'Si è verificato un errore'}`);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    uploadFirma,
    isLoading
  };
}
