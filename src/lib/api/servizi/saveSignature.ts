
import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';

export async function saveSignature(
  servizioId: string,
  signatureDataUrl: string
): Promise<string> {
  try {
    // Extract the base64 data from the data URL
    const base64Data = signatureDataUrl.split(',')[1];
    if (!base64Data) {
      throw new Error('Invalid signature data');
    }

    // Convert base64 to arraybuffer for storage
    const signatureArrayBuffer = decode(base64Data);

    // Create a unique filename using servizioId and timestamp
    const timestamp = new Date().getTime();
    const fileName = `${servizioId}_${timestamp}.png`;
    const filePath = `${servizioId}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('firme')
      .upload(filePath, signatureArrayBuffer, {
        contentType: 'image/png',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading signature:', error);
      throw error;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('firme')
      .getPublicUrl(filePath);

    // Update the servizio record with the signature URL
    const { error: updateError } = await supabase
      .from('servizi')
      .update({
        firma_url: publicUrl,
        firma_timestamp: new Date().toISOString(),
      })
      .eq('id', servizioId);

    if (updateError) {
      console.error('Error updating servizio with signature URL:', updateError);
      throw updateError;
    }

    return publicUrl;
  } catch (error) {
    console.error('Error in saveSignature:', error);
    throw error;
  }
}
