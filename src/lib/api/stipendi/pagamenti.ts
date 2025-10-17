import { supabase } from '@/lib/supabase';

// ============================================================================
// TYPES
// ============================================================================

export interface PagamentoStipendio {
  id: string;
  user_id: string;
  mese: number;
  anno: number;
  importo: number;
  data_pagamento: string;
  modalita_pagamento_id: string;
  spesa_aziendale_id: string | null;
  stato: 'pagato' | 'annullato';
  note: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Relations (opzionali, aggiunte dal join)
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    color: string | null;
  };
  modalita_pagamenti?: {
    nome: string;
  };
}

export interface PagamentoStipendioDetail extends PagamentoStipendio {
  spese_aziendali?: {
    id: string;
    causale: string;
    importo: number;
    tipologia: string;
    stato_pagamento: string;
    data_movimento: string;
  } | null;
}

export interface FiltriPagamenti {
  anno?: number;
  mese?: number;
  user_id?: string;
  stato?: 'pagato' | 'annullato';
}

export interface CreatePagamentoInput {
  user_id: string;
  mese: number;
  anno: number;
  importo: number;
  data_pagamento?: string; // opzionale, default CURRENT_DATE
  modalita_pagamento_id: string;
  note?: string;
}

// ============================================================================
// FUNCTIONS
// ============================================================================

/**
 * Recupera lista pagamenti con filtri opzionali
 */
export async function fetchPagamentiStipendi(
  filtri?: FiltriPagamenti
): Promise<PagamentoStipendio[]> {
  try {
    console.log('[fetchPagamentiStipendi] Fetching with filters:', filtri);

    // Query base con join
    let query = supabase
      .from('pagamenti_stipendi')
      .select(`
        *,
        profiles!pagamenti_stipendi_user_id_fkey (
          first_name,
          last_name,
          color
        ),
        modalita_pagamenti (
          nome
        )
      `)
      .order('data_pagamento', { ascending: false })
      .order('created_at', { ascending: false });

    // Applica filtri
    if (filtri?.anno) {
      query = query.eq('anno', filtri.anno);
    }
    if (filtri?.mese) {
      query = query.eq('mese', filtri.mese);
    }
    if (filtri?.user_id) {
      query = query.eq('user_id', filtri.user_id);
    }
    if (filtri?.stato) {
      query = query.eq('stato', filtri.stato);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[fetchPagamentiStipendi] Database error:', error);
      throw new Error(`Errore nel recupero dei pagamenti: ${error.message}`);
    }

    console.log(`[fetchPagamentiStipendi] Found ${data?.length || 0} pagamenti`);
    return (data || []) as PagamentoStipendio[];
  } catch (error) {
    console.error('[fetchPagamentiStipendi] Error:', error);
    throw error;
  }
}

/**
 * Crea nuovo pagamento con validazioni
 */
export async function createPagamentoStipendio(
  input: CreatePagamentoInput
): Promise<PagamentoStipendioDetail> {
  try {
    console.log('[createPagamentoStipendio] Creating payment:', input);

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utente non autenticato');
    }

    // 1. Validazione: verifica che user_id sia dipendente o socio
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', input.user_id)
      .single();

    if (profileError || !profile) {
      throw new Error('Dipendente non trovato');
    }

    if (!['dipendente', 'socio'].includes(profile.role)) {
      throw new Error('Il pagamento può essere effettuato solo a dipendenti o soci');
    }

    // 2. Check duplicato (user + mese + anno)
    const { data: existing } = await supabase
      .from('pagamenti_stipendi')
      .select('id')
      .eq('user_id', input.user_id)
      .eq('mese', input.mese)
      .eq('anno', input.anno)
      .maybeSingle();

    if (existing) {
      throw new Error(
        `Esiste già un pagamento per questo dipendente nel mese ${input.mese}/${input.anno}`
      );
    }

    // 3. Verifica modalità pagamento attiva
    const { data: modalita, error: modalitaError } = await supabase
      .from('modalita_pagamenti')
      .select('attivo')
      .eq('id', input.modalita_pagamento_id)
      .single();

    if (modalitaError || !modalita?.attivo) {
      throw new Error('Modalità di pagamento non valida o non attiva');
    }

    // 4. Insert pagamento
    const { data, error } = await supabase
      .from('pagamenti_stipendi')
      .insert({
        user_id: input.user_id,
        mese: input.mese,
        anno: input.anno,
        importo: input.importo,
        data_pagamento: input.data_pagamento || new Date().toISOString().split('T')[0],
        modalita_pagamento_id: input.modalita_pagamento_id,
        note: input.note || null,
        stato: 'pagato',
        created_by: user.id,
      })
      .select(`
        *,
        profiles!pagamenti_stipendi_user_id_fkey (
          first_name,
          last_name,
          color
        ),
        modalita_pagamenti (
          nome
        ),
        spese_aziendali (
          id,
          causale,
          importo,
          tipologia,
          stato_pagamento,
          data_movimento
        )
      `)
      .single();

    if (error) {
      console.error('[createPagamentoStipendio] Database error:', error);
      
      if (error.code === '23505') {
        throw new Error('Pagamento duplicato: esiste già un pagamento per questo periodo');
      }
      
      throw new Error(`Errore nella creazione del pagamento: ${error.message}`);
    }

    console.log('[createPagamentoStipendio] Payment created:', data.id);
    
    // Il trigger ha creato automaticamente spesa_aziendale
    return data as PagamentoStipendioDetail;
  } catch (error) {
    console.error('[createPagamentoStipendio] Error:', error);
    throw error;
  }
}

/**
 * Recupera dettaglio singolo pagamento
 */
export async function getPagamentoDetail(
  id: string
): Promise<PagamentoStipendioDetail | null> {
  try {
    console.log('[getPagamentoDetail] Fetching payment:', id);

    const { data, error } = await supabase
      .from('pagamenti_stipendi')
      .select(`
        *,
        profiles!pagamenti_stipendi_user_id_fkey (
          first_name,
          last_name,
          color
        ),
        modalita_pagamenti (
          nome
        ),
        spese_aziendali (
          id,
          causale,
          importo,
          tipologia,
          stato_pagamento,
          data_movimento
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[getPagamentoDetail] Database error:', error);
      throw new Error(`Errore nel recupero del pagamento: ${error.message}`);
    }

    if (!data) {
      console.log('[getPagamentoDetail] Payment not found');
      return null;
    }

    console.log('[getPagamentoDetail] Payment found');
    return data as PagamentoStipendioDetail;
  } catch (error) {
    console.error('[getPagamentoDetail] Error:', error);
    throw error;
  }
}

/**
 * Annulla pagamento + gestisce spesa collegata
 */
export async function annullaPagamento(
  id: string,
  motivazione: string
): Promise<PagamentoStipendioDetail> {
  try {
    console.log('[annullaPagamento] Annullando payment:', id);

    if (!motivazione || motivazione.trim().length === 0) {
      throw new Error("La motivazione dell'annullamento è obbligatoria");
    }

    // 1. Fetch pagamento corrente
    const { data: pagamento, error: fetchError } = await supabase
      .from('pagamenti_stipendi')
      .select('*, spese_aziendali(id, note)')
      .eq('id', id)
      .single();

    if (fetchError || !pagamento) {
      throw new Error('Pagamento non trovato');
    }

    if (pagamento.stato === 'annullato') {
      throw new Error('Il pagamento è già stato annullato');
    }

    // 2. Update pagamento → stato = 'annullato'
    const noteAggiornate = pagamento.note 
      ? `${pagamento.note}\n\n[ANNULLATO] ${motivazione}`
      : `[ANNULLATO] ${motivazione}`;

    const { data: pagamentoAggiornato, error: updateError } = await supabase
      .from('pagamenti_stipendi')
      .update({
        stato: 'annullato',
        note: noteAggiornate,
      })
      .eq('id', id)
      .select(`
        *,
        profiles!pagamenti_stipendi_user_id_fkey (
          first_name,
          last_name,
          color
        ),
        modalita_pagamenti (
          nome
        ),
        spese_aziendali (
          id,
          causale,
          importo,
          tipologia,
          stato_pagamento,
          data_movimento
        )
      `)
      .single();

    if (updateError) {
      console.error('[annullaPagamento] Update error:', updateError);
      throw new Error(`Errore nell'annullamento: ${updateError.message}`);
    }

    // 3. Aggiorna spesa_aziendale collegata (se esiste)
    if (pagamento.spesa_aziendale_id && pagamento.spese_aziendali) {
      const spesaData = Array.isArray(pagamento.spese_aziendali) 
        ? pagamento.spese_aziendali[0] 
        : pagamento.spese_aziendali;
      const spesaNote = spesaData?.note || '';
      const spesaNoteAggiornate = spesaNote
        ? `${spesaNote}\n\n[ANNULLATO] Pagamento annullato: ${motivazione}`
        : `[ANNULLATO] Pagamento annullato: ${motivazione}`;

      await supabase
        .from('spese_aziendali')
        .update({
          note: spesaNoteAggiornate,
        })
        .eq('id', pagamento.spesa_aziendale_id);
    }

    console.log('[annullaPagamento] Payment annullato successfully');
    return pagamentoAggiornato as PagamentoStipendioDetail;
  } catch (error) {
    console.error('[annullaPagamento] Error:', error);
    throw error;
  }
}
