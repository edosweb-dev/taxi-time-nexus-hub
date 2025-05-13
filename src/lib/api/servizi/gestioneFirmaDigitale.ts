
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
    const base64Parts = firmaBase64.split(',');
    if (base64Parts.length !== 2 || !base64Parts[0].includes('image/png')) {
      console.error("Formato base64 non valido", base64Parts[0]);
      throw new Error("Formato base64 non valido");
    }
    
    const base64Data = base64Parts[1];
    if (!base64Data || base64Data.trim() === '') {
      console.error("Dati base64 vuoti");
      throw new Error("Dati firma vuoti");
    }
    
    // Decodifica i dati base64 per verificare che contengano dati immagine reali
    try {
      const binaryData = atob(base64Data);
      if (binaryData.length < 100) {
        console.error("Dati immagine troppo piccoli dopo decodifica:", binaryData.length);
        throw new Error("Firma troppo semplice o vuota");
      }
      console.log(`Dati immagine decodificati correttamente: ${binaryData.length} bytes`);
      
      // Analisi dei dati binari per verificare se è un'immagine completamente bianca
      // Campione casuale di byte per verificare se sono tutti 0 o 255 (bianco)
      let allWhite = true;
      let checkSampleSize = Math.min(1000, binaryData.length);
      let checkInterval = Math.floor(binaryData.length / checkSampleSize);
      
      for (let i = 0; i < binaryData.length; i += checkInterval) {
        if (binaryData.charCodeAt(i) !== 0 && binaryData.charCodeAt(i) !== 255) {
          allWhite = false;
          break;
        }
      }
      
      if (allWhite) {
        console.warn("Possibile immagine completamente bianca o trasparente");
      }
    } catch (error) {
      console.error("Errore nella decodifica base64:", error);
      throw new Error("Formato firma non valido");
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
    
    // Carica l'immagine nel bucket "firme"
    // Converti il base64 in un blob per un upload migliore
    const blob = await fetch(`data:image/png;base64,${base64Data}`).then(res => res.blob());
    
    // Verifica che il blob non sia vuoto
    if (blob.size < 100) {
      console.error("Blob troppo piccolo:", blob.size);
      throw new Error("Immagine firma vuota o troppo piccola");
    }
    
    console.log("Dimensione blob per upload:", blob.size, "bytes");
    
    const { data, error: uploadError } = await supabase.storage
      .from('firme')
      .upload(fileName, blob, {
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
    
    // Pulisci URL da eventuali doppie slash
    const cleanUrl = publicUrl.replace(/([^:]\/)\/+/g, "$1");
    console.log("URL pubblico generato:", cleanUrl);
    
    // Aggiorna il servizio con l'URL della firma e il timestamp
    const { error: updateError } = await updateFirmaServizio({
      id: servizioId,
      firma_url: cleanUrl,
      firma_timestamp: timestamp
    });
      
    if (updateError) {
      console.error("Errore aggiornamento servizio:", updateError);
      throw updateError;
    }
    
    return { success: true, url: cleanUrl, timestamp };
    
  } catch (error: any) {
    console.error('Errore nel salvataggio della firma:', error);
    return { success: false, error };
  }
}
