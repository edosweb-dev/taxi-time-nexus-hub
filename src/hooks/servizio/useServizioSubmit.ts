import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ServizioFormMode, ServizioFormData } from './useServizioForm';

interface UseServizioSubmitOptions {
  mode: ServizioFormMode;
  servizioId?: string;
  onSuccess?: (data: any) => void;
}

type SubmitFunction = (formData: ServizioFormData, dirtyFields?: any) => Promise<{ data: any; error: any }>;

/**
 * Submit logic hook for servizio create/edit
 * 
 * CRITICAL DIFFERENCES:
 * - CREATE: Can insert all fields, can derive final values
 * - EDIT: ONLY updates dirty fields, never derives, never overwrites unchanged
 */
export const useServizioSubmit = ({
  mode,
  servizioId,
  onSuccess,
}: UseServizioSubmitOptions): SubmitFunction => {
  
  const navigate = useNavigate();
  
  const submitCreate = useCallback(async (formData: ServizioFormData) => {
    console.log('[SUBMIT-CREATE] ========================================');
    console.log('[SUBMIT-CREATE] Creating new servizio...');
    console.log('[SUBMIT-CREATE] Form data:', formData);
    
    try {
      const finalData: Record<string, any> = {
        ...formData,
        stato: 'bozza',
        created_at: new Date().toISOString(),
      };
      
      console.log('[SUBMIT-CREATE] Final data being inserted:', finalData);
      
      const { data, error } = await supabase
        .from('servizi')
        .insert(finalData as any)
        .select()
        .single();
      
      if (error) {
        console.error('[SUBMIT-CREATE] ❌ Error:', error);
        toast.error('Errore nella creazione del servizio');
        return { data: null, error };
      }
      
      console.log('[SUBMIT-CREATE] ✅ Success:', data);
      toast.success('Servizio creato con successo');
      
      if (onSuccess) onSuccess(data);
      
      navigate('/servizi');
      
      return { data, error: null };
      
    } catch (error: any) {
      console.error('[SUBMIT-CREATE] ❌ Exception:', error);
      toast.error('Errore imprevisto nella creazione');
      return { data: null, error };
    }
  }, [navigate, onSuccess]);
  
  const submitUpdate = useCallback(async (
    formData: ServizioFormData,
    dirtyFields: any = {}
  ) => {
    console.log('[SUBMIT-UPDATE] ========================================');
    console.log('[SUBMIT-UPDATE] Updating existing servizio...');
    console.log('[SUBMIT-UPDATE] servizioId:', servizioId);
    console.log('[SUBMIT-UPDATE] Dirty fields:', Object.keys(dirtyFields));
    
    if (!servizioId) {
      const error = new Error('servizioId is required for update');
      console.error('[SUBMIT-UPDATE] ❌', error);
      toast.error('Errore: ID servizio mancante');
      return { data: null, error };
    }
    
    try {
      // ✅ CRITICAL: Extract ONLY dirty fields
      const updateData: Record<string, any> = {};
      
      Object.keys(dirtyFields).forEach((key) => {
        if (dirtyFields[key]) {
          updateData[key] = (formData as any)[key];
        }
      });
      
      if (Object.keys(updateData).length === 0) {
        console.log('[SUBMIT-UPDATE] ⚠️ No fields changed, skipping update');
        toast.info('Nessuna modifica da salvare');
        navigate('/servizi');
        return { data: null, error: null };
      }
      
      console.log('[SUBMIT-UPDATE] ✅ Updating ONLY these fields:', updateData);
      console.log('[SUBMIT-UPDATE] ⛔ NOT touching unchanged fields');
      
      const { data, error } = await supabase
        .from('servizi')
        .update(updateData)
        .eq('id', servizioId)
        .select()
        .single();
      
      if (error) {
        console.error('[SUBMIT-UPDATE] ❌ Error:', error);
        toast.error('Errore nell\'aggiornamento del servizio');
        return { data: null, error };
      }
      
      console.log('[SUBMIT-UPDATE] ✅ Success:', data);
      toast.success('Servizio aggiornato con successo');
      
      if (onSuccess) onSuccess(data);
      
      navigate('/servizi');
      
      return { data, error: null };
      
    } catch (error: any) {
      console.error('[SUBMIT-UPDATE] ❌ Exception:', error);
      toast.error('Errore imprevisto nell\'aggiornamento');
      return { data: null, error };
    }
  }, [servizioId, navigate, onSuccess]);
  
  return mode === 'create' ? submitCreate : submitUpdate;
};
