import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useServizioForm } from '@/hooks/servizio/useServizioForm';
import { useServizioSubmit } from '@/hooks/servizio/useServizioSubmit';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ServizioFormFields } from '@/components/servizi/ServizioFormFields';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

/**
 * NEW Edit Page - Clean implementation using Phase 1 hooks
 * 
 * Route: /servizi/:id/edit-v2 (NEW - does not interfere with legacy)
 * 
 * Key features:
 * - Guaranteed data loading before render
 * - Only updates dirty fields
 * - No derivation logic (preserves existing data)
 */
export default function ServizioEditPageV2() {
  const { id: servizioId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  console.log('[ServizioEditPageV2] Mounted with servizioId:', servizioId);

  // ===== LOAD EXISTING SERVIZIO DATA =====
  const {
    data: servizioData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['servizio-edit-v2', servizioId],
    queryFn: async () => {
      if (!servizioId) throw new Error('Servizio ID is required');

      const { data, error } = await supabase
        .from('servizi')
        .select(`
          *,
          aziende:azienda_id (id, nome),
          servizi_passeggeri (
            id, passeggero_id, nome_cognome_inline, email_inline, telefono_inline,
            indirizzo_inline, localita_inline,
            orario_presa_personalizzato, luogo_presa_personalizzato,
            localita_presa_personalizzato, destinazione_personalizzato,
            localita_destinazione_personalizzato, usa_indirizzo_personalizzato,
            usa_destinazione_personalizzata, ordine_presa, salva_in_database,
            passeggeri:passeggero_id(*)
          )
        `)
        .eq('id', servizioId)
        .single();

      if (error) {
        console.error('[ServizioEditPageV2] ❌ Error loading:', error);
        throw error;
      }

      console.log('[ServizioEditPageV2] ✅ Data loaded:', {
        id: data.id,
        indirizzo_presa: data.indirizzo_presa,
        indirizzo_destinazione: data.indirizzo_destinazione,
        metodo_pagamento: data.metodo_pagamento,
        stato: data.stato,
      });

      return data;
    },
    enabled: !!servizioId,
  });

  // ===== INITIALIZE FORM (Edit Mode) =====
  const { form, shouldRender, mode } = useServizioForm({
    mode: 'edit',
    initialData: servizioData,
  });

  // ===== SUBMIT HOOK (Edit Mode - Dirty Fields Only) =====
  const submit = useServizioSubmit({
    mode: 'edit',
    servizioId,
    onSuccess: () => {
      navigate(`/servizi/${servizioId}`);
    },
  });

  // ===== FORM SUBMIT HANDLER =====
  const onSubmit = async (formData: any) => {
    console.log('[ServizioEditPageV2] Form submitted');
    console.log('[ServizioEditPageV2] Dirty fields:', form.formState.dirtyFields);
    await submit(formData, form.formState.dirtyFields);
  };

  // ===== LOADING STATE =====
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Caricamento servizio...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // ===== ERROR STATE =====
  if (isError) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <p className="text-4xl">⚠️</p>
            <p className="text-lg font-semibold text-foreground">Errore nel caricamento</p>
            <p className="text-sm text-muted-foreground">
              {(error as any)?.message || 'Impossibile caricare i dati del servizio'}
            </p>
            <Button variant="outline" onClick={() => navigate('/servizi')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna ai servizi
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // ===== GUARD: Don't render form until data is ready =====
  if (!shouldRender) {
    console.log('[ServizioEditPageV2] ⏳ Waiting for data before render...');
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Preparazione form...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <MainLayout>
      <div className="space-y-6 min-h-full pb-20">
        <Button variant="ghost" onClick={() => navigate(`/servizi/${servizioId}`)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna al dettaglio
        </Button>

        {/* Header */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Modifica Servizio</h1>
              <p className="text-muted-foreground mt-1">
                Servizio #{servizioData?.id_progressivo || servizioId?.slice(0, 8)}
              </p>
            </div>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
              🆕 V2 (bug-free)
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-card border rounded-lg p-6 space-y-6">
          {/* ✅ Shared form fields component */}
          <ServizioFormFields form={form} mode={mode} />

          {/* Debug Info */}
          <div className="bg-muted p-4 rounded-md border">
            <h3 className="font-semibold text-sm mb-2 text-foreground">🔍 Debug Info:</h3>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>Mode: <strong className="text-primary">{mode}</strong></li>
              <li>Servizio ID: <strong>{servizioId}</strong></li>
              <li>Form dirty: <strong>{form.formState.isDirty ? 'Yes' : 'No'}</strong></li>
              <li>Dirty fields: <strong>{Object.keys(form.formState.dirtyFields).join(', ') || '(none)'}</strong></li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={!form.formState.isDirty || form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                'Salva Modifiche'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(`/servizi/${servizioId}`)}>
              Annulla
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
