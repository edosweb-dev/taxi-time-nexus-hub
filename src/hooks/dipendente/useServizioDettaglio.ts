import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ServizioDettaglio {
  id: string;
  id_progressivo?: string;
  data_servizio: string;
  orario_servizio: string;
  stato: string;
  numero_commessa?: string;
  metodo_pagamento: string;
  indirizzo_presa: string;
  citta_presa?: string;
  indirizzo_destinazione: string;
  citta_destinazione?: string;
  note?: string;
  firma_url?: string;
  firma_timestamp?: string;
  incasso_ricevuto?: number;
  ore_effettive?: number;
  ore_fatturate?: number;
  iva?: number;
  azienda_nome?: string;
  azienda_email?: string;
  referente_nome?: string;
  referente_cognome?: string;
  veicolo_modello?: string;
  veicolo_targa?: string;
  veicolo_numero_posti?: number;
  assegnato_a_nome?: string;
  assegnato_a_cognome?: string;
}

export interface PasseggeroDettaglio {
  id: string;
  nome_cognome: string;
  email?: string;
  telefono?: string;
  localita?: string;
  indirizzo?: string;
  orario_presa_personalizzato?: string;
  luogo_presa_personalizzato?: string;
  destinazione_personalizzato?: string;
}

export function useServizioDettaglio(servizioId?: string) {
  const { profile } = useAuth();

  const { data: servizio, isLoading: isLoadingServizio, error: errorServizio } = useQuery({
    queryKey: ['servizio-dettaglio', servizioId],
    queryFn: async () => {
      if (!servizioId || !profile?.id) return null;

      const { data, error } = await supabase
        .from('servizi')
        .select(`
          *,
          aziende!left(nome, email),
          profiles!servizi_referente_id_fkey(first_name, last_name),
          veicoli!left(modello, targa, numero_posti),
          assegnato:profiles!servizi_assegnato_a_fkey(first_name, last_name)
        `)
        .eq('id', servizioId)
        .eq('assegnato_a', profile.id)
        .single();

      if (error) throw error;
      if (!data) return null;

      const azienda = Array.isArray(data.aziende) ? data.aziende[0] : data.aziende;
      const referente = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
      const veicolo = Array.isArray(data.veicoli) ? data.veicoli[0] : data.veicoli;
      const assegnato = Array.isArray(data.assegnato) ? data.assegnato[0] : data.assegnato;

      return {
        ...data,
        azienda_nome: azienda?.nome,
        azienda_email: azienda?.email,
        referente_nome: referente?.first_name,
        referente_cognome: referente?.last_name,
        veicolo_modello: veicolo?.modello,
        veicolo_targa: veicolo?.targa,
        veicolo_numero_posti: veicolo?.numero_posti,
        assegnato_a_nome: assegnato?.first_name,
        assegnato_a_cognome: assegnato?.last_name,
      } as ServizioDettaglio;
    },
    enabled: !!servizioId && !!profile?.id,
    staleTime: 1 * 60 * 1000, // 1 min
    refetchOnWindowFocus: true,
  });

  const { data: passeggeri = [], isLoading: isLoadingPasseggeri } = useQuery({
    queryKey: ['servizio-passeggeri', servizioId],
    queryFn: async () => {
      if (!servizioId) return [];

      const { data, error } = await supabase
        .from('servizi_passeggeri')
        .select(`
          id,
          orario_presa_personalizzato,
          luogo_presa_personalizzato,
          destinazione_personalizzato,
          passeggeri!inner(
            nome_cognome,
            email,
            telefono,
            localita,
            indirizzo
          )
        `)
        .eq('servizio_id', servizioId)
        .order('orario_presa_personalizzato', { ascending: true, nullsFirst: false });

      if (error) throw error;

      return (data || []).map(sp => {
        const p = Array.isArray(sp.passeggeri) ? sp.passeggeri[0] : sp.passeggeri;
        return {
          id: sp.id,
          nome_cognome: p?.nome_cognome || '',
          email: p?.email,
          telefono: p?.telefono,
          localita: p?.localita,
          indirizzo: p?.indirizzo,
          orario_presa_personalizzato: sp.orario_presa_personalizzato,
          luogo_presa_personalizzato: sp.luogo_presa_personalizzato,
          destinazione_personalizzato: sp.destinazione_personalizzato,
        } as PasseggeroDettaglio;
      });
    },
    enabled: !!servizioId,
    staleTime: 5 * 60 * 1000, // 5 min
  });

  return {
    servizio,
    passeggeri,
    isLoading: isLoadingServizio || isLoadingPasseggeri,
    error: errorServizio,
  };
}
