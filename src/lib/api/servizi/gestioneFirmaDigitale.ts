
import { supabase } from '@/lib/supabase';
import { updateFirmaServizio } from './updateFirmaServizio';

// Function to check if firma digitale is active for an azienda
export async function checkFirmaDigitaleAttiva(aziendaId: string): Promise<boolean> {
  try {
    console.log('Checking firma digitale for azienda:', aziendaId);
    const { data, error } = await supabase
      .from('aziende')
      .select('firma_digitale_attiva')
      .eq('id', aziendaId)
      .single();
    
    if (error) {
      console.error('Error checking firma digitale:', error);
      return false;
    }
    
    console.log('Firma digitale attiva check result:', data?.firma_digitale_attiva);
    return data?.firma_digitale_attiva === true;
  } catch (error) {
    console.error('Unexpected error checking firma digitale:', error);
    return false;
  }
}

// Add upload function to handle firma digitale
export async function uploadFirma(servizioId: string, firmaBase64: string) {
  try {
    console.log('Upload firma called for servizio:', servizioId);
    console.log('Base64 length:', firmaBase64?.length || 0);
    return await salvaFirmaDigitale(servizioId, firmaBase64);
  } catch (error) {
    console.error('Error uploading firma:', error);
    return { success: false, error };
  }
}

export async function salvaFirmaDigitale(servizioId: string, firmaBase64: string) {
  try {
    console.log("salvaFirmaDigitale: Inizio processo per servizio:", servizioId);
    
    // Verifica se il firmaBase64 è valido
    if (!firmaBase64 || firmaBase64.length < 1000) {
      console.error("Firma non valida o troppo piccola", firmaBase64?.substring(0, 50) + "...");
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
    
    // Crea un timestamp per il nome del file e prevenire la cache
    const timestamp = new Date().toISOString();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileName = `firma_${servizioId}_${timestamp.replace(/[:.]/g, '-')}_${randomId}.png`;
    
    console.log(`Caricamento firma: ${fileName}`);
    
    // Converti il base64 in un blob per un upload migliore
    const blob = await fetch(`data:image/png;base64,${base64Data}`).then(res => res.blob());
    
    // Verifica che il blob non sia vuoto
    if (blob.size < 100) {
      console.error("Blob troppo piccolo:", blob.size);
      throw new Error("Immagine firma vuota o troppo piccola");
    }
    
    console.log("Dimensione blob per upload:", blob.size, "bytes");
    
    // Get current auth session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      console.error("Errore di sessione:", sessionError);
      throw new Error("Sessione utente non valida. Effettua nuovamente l'accesso.");
    }
    
    console.log("Sessione valida, utente autenticato:", sessionData.session.user.id);
    
    // Check if bucket exists
    console.log("Verifico esistenza bucket 'firme'");
    const { data: buckets, error: listBucketsError } = await supabase.storage.listBuckets();
    
    if (listBucketsError) {
      console.error("Errore nel controllare i bucket:", listBucketsError);
      throw listBucketsError;
    }
    
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
      
      // Imposta il bucket come pubblico dopo la creazione
      const { error: updateBucketError } = await supabase.storage.updateBucket('firme', {
        public: true,
        fileSizeLimit: 1024 * 1024 // 1MB limit
      });
      
      if (updateBucketError) {
        console.error("Errore nell'aggiornamento del bucket:", updateBucketError);
      }
    } else {
      console.log("Bucket 'firme' già esistente");
    }
    
    // Upload del file nel bucket storage "firme"
    console.log("Iniziando upload file nel bucket 'firme'");
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('firme')
      .upload(fileName, blob, {
        contentType: 'image/png',
        upsert: true,
        cacheControl: 'no-cache, no-store, must-revalidate'
      });
      
    if (uploadError) {
      console.error("Errore upload:", uploadError);
      throw uploadError;
    }
    
    console.log("Upload completato:", uploadData);
    
    // Ottieni l'URL pubblico della firma con parametro di cache-busting
    const { data: { publicUrl } } = supabase.storage
      .from('firme')
      .getPublicUrl(fileName);
    
    // Pulisci URL da eventuali doppie slash
    const cleanUrl = publicUrl.replace(/([^:]\/)\/+/g, "$1");
    console.log("URL pubblico generato:", cleanUrl);
    
    // Aggiorna il servizio con l'URL della firma e il timestamp
    console.log("Aggiornando servizio con URL firma:", { id: servizioId, firma_url: cleanUrl, firma_timestamp: timestamp });
    const { data: updateResult, error: updateError } = await updateFirmaServizio({
      id: servizioId,
      firma_url: cleanUrl,
      firma_timestamp: timestamp
    });
      
    if (updateError) {
      console.error("Errore aggiornamento servizio:", updateError);
      throw updateError;
    }
    
    console.log("Servizio aggiornato con successo:", updateResult);
    return { success: true, url: cleanUrl, timestamp };
    
  } catch (error: any) {
    console.error('Errore nel salvataggio della firma:', error);
    return { success: false, error };
  }
}
