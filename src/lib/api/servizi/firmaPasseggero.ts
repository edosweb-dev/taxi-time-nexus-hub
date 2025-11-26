import { supabase } from '@/lib/supabase';
import { dataURLToBlob } from '@/lib/utils/signatureHelpers';

export interface PasseggeroFirma {
  id: string;
  servizio_passeggero_id: string;
  nome_cognome: string;
  firma_url: string | null;
  firma_timestamp: string | null;
  has_signed: boolean;
}

/**
 * Carica la firma di un singolo passeggero
 */
export async function uploadFirmaPasseggero(
  servizioPasseggeroId: string,
  firmaBase64: string
): Promise<{ success: boolean; url?: string; timestamp?: string; error?: string }> {
  try {
    console.log('uploadFirmaPasseggero: Starting for servizio_passeggero_id:', servizioPasseggeroId);

    // Validazione base64
    if (!firmaBase64 || !firmaBase64.includes('data:image')) {
      console.error('uploadFirmaPasseggero: Invalid base64 data');
      return { success: false, error: 'Dati firma non validi' };
    }

    // Estrai e pulisci i dati base64
    const base64Data = firmaBase64.split(',')[1];
    if (!base64Data || base64Data.trim() === '') {
      console.error('uploadFirmaPasseggero: Empty base64 data after split');
      return { success: false, error: 'Dati firma vuoti' };
    }

    // Converti a Blob
    const blob = dataURLToBlob(firmaBase64);
    console.log('uploadFirmaPasseggero: Blob created, size:', blob.size);

    if (blob.size < 100) {
      console.error('uploadFirmaPasseggero: Blob too small:', blob.size);
      return { success: false, error: 'Firma troppo semplice' };
    }

    // Genera nome file univoco
    const timestamp = new Date().getTime();
    const filename = `firma_passeggero_${servizioPasseggeroId}_${timestamp}.png`;
    console.log('uploadFirmaPasseggero: Uploading file:', filename);

    // Upload a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('firme')
      .upload(filename, blob, {
        contentType: 'image/png',
        upsert: false,
      });

    if (uploadError) {
      console.error('uploadFirmaPasseggero: Upload error:', uploadError);
      return { success: false, error: uploadError.message };
    }

    console.log('uploadFirmaPasseggero: Upload successful:', uploadData);

    // Ottieni URL pubblico
    const { data: urlData } = supabase.storage
      .from('firme')
      .getPublicUrl(filename);

    const publicUrl = urlData.publicUrl;
    const firmaTimestamp = new Date().toISOString();

    console.log('uploadFirmaPasseggero: Public URL:', publicUrl);

    // Aggiorna record servizi_passeggeri
    const { error: updateError } = await supabase
      .from('servizi_passeggeri')
      .update({
        firma_url: publicUrl,
        firma_timestamp: firmaTimestamp,
      })
      .eq('id', servizioPasseggeroId);

    if (updateError) {
      console.error('uploadFirmaPasseggero: Update error:', updateError);
      return { success: false, error: updateError.message };
    }

    console.log('uploadFirmaPasseggero: Record updated successfully');

    return {
      success: true,
      url: publicUrl,
      timestamp: firmaTimestamp,
    };
  } catch (error: any) {
    console.error('uploadFirmaPasseggero: Unexpected error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Ottiene lo stato delle firme di tutti i passeggeri di un servizio
 */
export async function getFirmePasseggeri(servizioId: string): Promise<PasseggeroFirma[]> {
  try {
    console.log('getFirmePasseggeri: Fetching for servizio_id:', servizioId);

    const { data, error } = await supabase
      .from('servizi_passeggeri')
      .select(`
        id,
        nome_cognome_inline,
        firma_url,
        firma_timestamp,
        passeggero_id,
        passeggeri (
          nome_cognome
        )
      `)
      .eq('servizio_id', servizioId);

    if (error) {
      console.error('getFirmePasseggeri: Query error:', error);
      throw error;
    }

    console.log('getFirmePasseggeri: Data fetched:', data);

    // Mappa i risultati
    const firme: PasseggeroFirma[] = data.map((item: any) => ({
      id: item.id,
      servizio_passeggero_id: item.id,
      nome_cognome: item.nome_cognome_inline || item.passeggeri?.nome_cognome || 'Passeggero',
      firma_url: item.firma_url,
      firma_timestamp: item.firma_timestamp,
      has_signed: !!item.firma_url,
    }));

    console.log('getFirmePasseggeri: Mapped firme:', firme);
    return firme;
  } catch (error: any) {
    console.error('getFirmePasseggeri: Error:', error);
    return [];
  }
}

/**
 * Verifica se tutti i passeggeri hanno firmato
 */
export async function checkAllPasseggeriSigned(servizioId: string): Promise<{
  allSigned: boolean;
  totalPasseggeri: number;
  firmati: number;
}> {
  const firme = await getFirmePasseggeri(servizioId);
  const firmati = firme.filter(f => f.has_signed).length;
  
  return {
    allSigned: firmati === firme.length && firme.length > 0,
    totalPasseggeri: firme.length,
    firmati,
  };
}
