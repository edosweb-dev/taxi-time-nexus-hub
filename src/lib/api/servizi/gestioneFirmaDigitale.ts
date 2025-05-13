
import { supabase } from '@/lib/supabase';
import { updateFirmaServizio } from './updateFirmaServizio';

export async function salvaFirmaDigitale(servizioId: string, firmaBase64: string) {
  try {
    console.log("salvaFirmaDigitale: Inizio processo");
    
    // Verifica se il firmaBase64 è valido
    if (!firmaBase64 || firmaBase64.length < 1000) {
      console.error("Firma non valida o troppo piccola", firmaBase64.substring(0, 50) + "...");
      throw new Error("Firma non valida");
    }
    
    // Estrai la parte base64 escludendo il prefisso "data:image/png;base64,"
    const base64Data = firmaBase64.split(',')[1];
    
    if (!base64Data) {
      console.error("Formato base64 non valido");
      throw new Error("Formato base64 non valido");
    }
    
    // Verifica che il bucket esista, altrimenti crealo
    const { data: buckets } = await supabase.storage.listBuckets();
    const firmeBucketExists = buckets?.some(bucket => bucket.name === 'firme');
    
    if (!firmeBucketExists) {
      console.log("Creando bucket 'firme'...");
      const { error } = await supabase.storage.createBucket('firme', {
        public: true
      });
      
      if (error) {
        console.error("Errore nella creazione del bucket:", error);
        throw error;
      }
    }
    
    // Crea un timestamp per il nome del file
    const timestamp = new Date().toISOString();
    const fileName = `firma_${servizioId}_${timestamp}.png`;
    
    console.log(`Caricamento firma: ${fileName}`);
    
    // Carica l'immagine nel bucket "firme" - percorso senza slash iniziale
    const { data, error: uploadError } = await supabase.storage
      .from('firme')
      .upload(fileName, base64Data, {
        contentType: 'image/png',
        upsert: true
      });
      
    if (uploadError) {
      console.error("Errore upload:", uploadError);
      throw uploadError;
    }
    
    console.log("Upload completato:", data);
    
    // Ottieni l'URL pubblico della firma
    const { data: { publicUrl } } = supabase.storage
      .from('firme')
      .getPublicUrl(fileName);
    
    console.log("URL pubblico generato:", publicUrl);
    
    // Aggiorna il servizio con l'URL della firma e il timestamp
    const { error: updateError } = await updateFirmaServizio({
      id: servizioId,
      firma_url: publicUrl,
      firma_timestamp: timestamp
    });
      
    if (updateError) {
      console.error("Errore aggiornamento servizio:", updateError);
      throw updateError;
    }
    
    return { success: true, url: publicUrl, timestamp };
    
  } catch (error: any) {
    console.error('Errore nel salvataggio della firma:', error);
    return { success: false, error };
  }
}
