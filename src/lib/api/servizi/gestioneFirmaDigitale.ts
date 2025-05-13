
import { supabase } from '@/lib/supabase';
import { updateFirmaServizio } from './updateFirmaServizio';

export async function salvaFirmaDigitale(servizioId: string, firmaBase64: string) {
  try {
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
    const { error: updateError } = await updateFirmaServizio({
      id: servizioId,
      firma_url: publicUrl,
      firma_timestamp: timestamp
    });
      
    if (updateError) {
      throw updateError;
    }
    
    return { success: true, url: publicUrl, timestamp };
    
  } catch (error: any) {
    console.error('Errore nel salvataggio della firma:', error);
    return { success: false, error };
  }
}
