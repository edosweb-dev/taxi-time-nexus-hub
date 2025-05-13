
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
    
    // Crea un timestamp per il nome del file
    const timestamp = new Date().toISOString();
    const fileName = `firma_${servizioId}_${timestamp}.png`;
    
    console.log(`Caricamento firma: ${fileName}`);
    
    // Converti il base64 in un blob per un upload migliore
    const blob = await fetch(`data:image/png;base64,${base64Data}`).then(res => res.blob());
    
    // Verifica che il blob non sia vuoto
    if (blob.size < 100) {
      console.error("Blob troppo piccolo:", blob.size);
      throw new Error("Immagine firma vuota o troppo piccola");
    }
    
    console.log("Dimensione blob per upload:", blob.size, "bytes");
    
    // Verifica se esiste già il bucket "firme" e crealo se non esiste
    const { data: buckets } = await supabase.storage.listBuckets();
    const firmeBucket = buckets?.find(bucket => bucket.name === 'firme');
    
    if (!firmeBucket) {
      console.log("Creazione del bucket 'firme'");
      const { error: createBucketError } = await supabase.storage.createBucket('firme', {
        public: true
      });
      
      if (createBucketError) {
        console.error("Errore nella creazione del bucket:", createBucketError);
        throw createBucketError;
      }
    } else {
      console.log("Bucket 'firme' già esistente");
    }
    
    // Aggiungiamo l'autenticazione esplicita per assicurarci che l'utente sia autenticato
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      console.error("Errore di autenticazione:", sessionError);
      throw new Error("Sessione utente non valida. Effettua nuovamente l'accesso.");
    }
    
    // Upload del file nel bucket storage "firme"
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
