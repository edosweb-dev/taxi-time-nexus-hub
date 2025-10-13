import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { dataURLToBlob, validateBlobSize } from '@/lib/utils/signatureHelpers';

interface CompletaServizioInput {
  servizioId: string;
  firmaDataURL: string;
  noteCompletamento?: string;
}

export function useCompletaServizio() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isCompleting, setIsCompleting] = useState(false);

  const mutation = useMutation({
    mutationFn: async ({ servizioId, firmaDataURL, noteCompletamento }: CompletaServizioInput) => {
      if (!profile?.id) throw new Error('User not authenticated');

      setIsCompleting(true);

      try {
        // Step 1: Convert signature to blob
        const blob = dataURLToBlob(firmaDataURL);

        // Step 2: Validate blob size
        if (!validateBlobSize(blob, 2)) {
          throw new Error('Firma troppo grande (max 2MB)');
        }

        // Step 3: Upload to Storage
        const fileName = `${servizioId}.png`;
        const filePath = `servizi/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('firme')
          .upload(filePath, blob, {
            contentType: 'image/png',
            upsert: true,
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error('Errore durante il caricamento della firma');
        }

        // Step 4: Get public URL
        const { data: urlData } = supabase.storage
          .from('firme')
          .getPublicUrl(filePath);

        // Step 5: Update servizio
        const { data, error: updateError } = await supabase
          .from('servizi')
          .update({
            stato: 'completato',
            firma_url: urlData.publicUrl,
            firma_timestamp: new Date().toISOString(),
            note: noteCompletamento || null,
          })
          .eq('id', servizioId)
          .eq('assegnato_a', profile.id)
          .eq('stato', 'assegnato') // Only complete if currently assigned
          .select()
          .single();

        if (updateError) {
          console.error('Update error:', updateError);
          throw new Error('Errore durante il completamento del servizio');
        }

        if (!data) {
          throw new Error('Servizio non trovato o non autorizzato');
        }

        return data;
      } finally {
        setIsCompleting(false);
      }
    },
    onSuccess: (_, variables) => {
      toast.success('Servizio completato! ✅');
      
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['servizi-assegnati'] });
      queryClient.invalidateQueries({ queryKey: ['servizio-dettaglio', variables.servizioId] });
      queryClient.invalidateQueries({ queryKey: ['servizi-agenda-giorno'] });
      queryClient.invalidateQueries({ queryKey: ['servizi-agenda-settimana'] });
      queryClient.invalidateQueries({ queryKey: ['servizi-agenda-mese'] });
      queryClient.invalidateQueries({ queryKey: ['servizi-oggi'] });
      queryClient.invalidateQueries({ queryKey: ['stats-mese'] });
    },
    onError: (error: Error) => {
      console.error('Completamento error:', error);
      toast.error(error.message || 'Errore durante il completamento del servizio');
    },
    retry: 2,
  });

  return {
    completaServizio: mutation.mutateAsync,
    isCompleting: isCompleting || mutation.isPending,
    error: mutation.error,
  };
}
