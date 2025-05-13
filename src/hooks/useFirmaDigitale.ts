
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
import { useQueryClient } from '@tanstack/react-query';

export function useFirmaDigitale() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const uploadFirma = async (servizioId: string, firmaBase64: string) => {
    try {
      setIsLoading(true);
      
      // Estrai la parte base64 escludendo il prefisso "data:image/png;base64,"
      const base64Data = firmaBase64.split(',')[1];
      
      // Crea un timestamp per il nome del file
      const timestamp = new Date().toISOString();
      const fileName = `firma_${servizioId}_${timestamp}.png`;
      
      // Carica l'immagine nel bucket "firme"
      const { data, error: uploadError } = await supabase.storage
        .from('firme')
        .upload(fileName, base64Data, {
          contentType: 'image/png',
          upsert: true
        });
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Ottieni l'URL pubblico della firma
      const { data: { publicUrl } } = supabase.storage
        .from('firme')
        .getPublicUrl(fileName);
      
      // Aggiorna il servizio con l'URL della firma e il timestamp
      const { error: updateError } = await supabase
        .from('servizi')
        .update({
          firma_url: publicUrl,
          firma_timestamp: timestamp
        })
        .eq('id', servizioId);
        
      if (updateError) {
        throw updateError;
      }
      
      // Invalida le query per aggiornare i dati
      queryClient.invalidateQueries({ queryKey: ['servizio', servizioId] });
      queryClient.invalidateQueries({ queryKey: ['servizi'] });
      
      toast.success("Firma salvata con successo");
      return { success: true, url: publicUrl, timestamp };
      
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
