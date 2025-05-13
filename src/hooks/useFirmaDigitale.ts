
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
      
      console.log("Inizio upload firma...");
      if (!firmaBase64) {
        console.error("Firma non fornita");
        toast.error("Firma non fornita");
        return { success: false, error: new Error("Firma non fornita") };
      }
      
      if (firmaBase64.length < 1000) {
        console.error("Firma troppo piccola o vuota:", firmaBase64.length);
        toast.error("Firma troppo semplice, prova a firmare nuovamente");
        return { success: false, error: new Error("Firma troppo semplice") };
      }
      
      console.log("Dimensione dati firma:", firmaBase64.length, "bytes");
      
      const result = await salvaFirmaDigitale(servizioId, firmaBase64);
      
      if (!result.success) {
        throw result.error;
      }
      
      // Invalida le query per aggiornare i dati
      queryClient.invalidateQueries({ queryKey: ['servizio', servizioId] });
      queryClient.invalidateQueries({ queryKey: ['servizi'] });
      
      return { success: true, url: result.url, timestamp: result.timestamp };
      
    } catch (error: any) {
      console.error('Errore nel salvataggio della firma:', error);
      toast.error(`Errore nel salvataggio della firma: ${error.message || 'Errore sconosciuto'}`);
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
