import { useForm, UseFormReturn } from 'react-hook-form';
import { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

export type ServizioFormMode = 'create' | 'edit';

const servizioFormSchema = z.object({
  azienda_id: z.string().min(1, 'Azienda obbligatoria'),
  data_servizio: z.string().min(1, 'Data obbligatoria'),
  ora_servizio: z.string().optional(),
  indirizzo_presa: z.string().optional(),
  indirizzo_presa_lat: z.number().nullable().optional(),
  indirizzo_presa_lng: z.number().nullable().optional(),
  indirizzo_destinazione: z.string().optional(),
  indirizzo_destinazione_lat: z.number().nullable().optional(),
  indirizzo_destinazione_lng: z.number().nullable().optional(),
  metodo_pagamento: z.string().optional(),
  incasso_netto_previsto: z.number().optional(),
  chilometri: z.number().optional(),
  note: z.string().optional(),
});

export type ServizioFormData = z.infer<typeof servizioFormSchema>;

interface UseServizioFormOptions {
  mode: ServizioFormMode;
  initialData?: any;
}

interface UseServizioFormReturn {
  form: UseFormReturn<ServizioFormData>;
  shouldRender: boolean;
  mode: ServizioFormMode;
}

/**
 * Form management hook for servizio create/edit
 * 
 * CRITICAL PATTERNS:
 * 1. In edit mode, component MUST NOT render until initialData is available
 * 2. defaultValues are memoized to prevent timing issues
 * 3. NO form.reset() in useEffect - defaultValues handle everything
 */
export const useServizioForm = ({
  mode,
  initialData,
}: UseServizioFormOptions): UseServizioFormReturn => {
  
  const shouldRender = mode === 'create' || (mode === 'edit' && !!initialData);
  
  const defaultValues = useMemo(() => {
    if (mode === 'create') {
      return {
        azienda_id: '',
        data_servizio: '',
        ora_servizio: '',
        indirizzo_presa: '',
        indirizzo_presa_lat: null,
        indirizzo_presa_lng: null,
        indirizzo_destinazione: '',
        indirizzo_destinazione_lat: null,
        indirizzo_destinazione_lng: null,
        metodo_pagamento: '',
        incasso_netto_previsto: 0,
        chilometri: 0,
        note: '',
      } as ServizioFormData;
    }
    
    if (!initialData) {
      console.warn('[useServizioForm] Edit mode but no initialData provided');
      return {} as ServizioFormData;
    }
    
    console.log('[useServizioForm] Mapping initialData to form:', {
      indirizzo_presa: initialData.indirizzo_presa,
      indirizzo_destinazione: initialData.indirizzo_destinazione,
      metodo_pagamento: initialData.metodo_pagamento,
    });
    
    return {
      azienda_id: initialData.azienda_id || '',
      data_servizio: initialData.data_servizio || '',
      ora_servizio: initialData.orario_servizio || '',
      indirizzo_presa: initialData.indirizzo_presa || '',
      indirizzo_presa_lat: initialData.indirizzo_presa_lat || null,
      indirizzo_presa_lng: initialData.indirizzo_presa_lng || null,
      indirizzo_destinazione: initialData.indirizzo_destinazione || '',
      indirizzo_destinazione_lat: initialData.indirizzo_destinazione_lat || null,
      indirizzo_destinazione_lng: initialData.indirizzo_destinazione_lng || null,
      metodo_pagamento: initialData.metodo_pagamento || '',
      incasso_netto_previsto: initialData.incasso_netto_previsto || 0,
      chilometri: initialData.km_totali || 0,
      note: initialData.note || '',
    } as ServizioFormData;
  }, [mode, initialData]);
  
  const form = useForm<ServizioFormData>({
    resolver: zodResolver(servizioFormSchema),
    defaultValues,
    mode: 'onChange',
  });
  
  console.log('[useServizioForm] Initialized:', {
    mode,
    hasInitialData: !!initialData,
    shouldRender,
    defaultValues: form.formState.defaultValues,
    actualFormValues: form.getValues(),
  });
  
  return {
    form,
    shouldRender,
    mode,
  };
};
