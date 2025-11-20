
import { useState } from "react";
import { useServizio, useServizi } from "./useServizi";
import { useUsers } from "./useUsers";
import { useAziende } from "./useAziende";
import { getServizioIndex } from "@/components/servizi/utils/formatUtils";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency as formatCurrencyUtil } from "@/components/servizi/utils/formatUtils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function useServizioDetail(id?: string) {
  const { profile } = useAuth();
  const isDipendente = profile?.role === 'dipendente';
  
  // Hook unificato: dipendenti vedono solo i loro servizi, admin vedono tutto
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['servizio-detail', id, isDipendente],
    queryFn: async () => {
      console.log('═══════════════════════════════════');
      console.log('🔍 [useServizioDetail] ID received:', id);
      console.log('🔍 [useServizioDetail] ID type:', typeof id);
      console.log('🔍 [useServizioDetail] isDipendente:', isDipendente);
      console.log('🔍 [useServizioDetail] profile.id:', profile?.id);
      console.log('═══════════════════════════════════');
      
      if (!id) return null;
      
      let query = supabase
        .from('servizi')
        .select(`
          *,
          aziende!left(id, nome, email, firma_digitale_attiva, partita_iva, created_at),
          veicoli!left(id, modello, targa, numero_posti),
          assegnato:profiles!servizi_assegnato_a_fkey(first_name, last_name),
          servizi_passeggeri!left(
            id,
            passeggero_id,
            nome_cognome_inline,
            email_inline,
            telefono_inline,
            localita_inline,
            indirizzo_inline,
            orario_presa_personalizzato,
            luogo_presa_personalizzato,
            destinazione_personalizzato,
            usa_indirizzo_personalizzato,
            salva_in_database,
            passeggeri:passeggero_id (
              id,
              nome_cognome,
              email,
              telefono,
              localita,
              indirizzo,
              azienda_id,
              created_by_referente_id
            )
          )
        `)
        .eq('id', id);
      
      // Se dipendente, filtra solo servizi assegnati a lui
      if (isDipendente && profile?.id) {
        query = query.eq('assegnato_a', profile.id);
      }
      
      const { data: servizioData, error: servizioError } = await query.single();
      
      if (servizioError) throw servizioError;
      if (!servizioData) return null;
      
      // Normalizza la struttura dati
      const azienda = Array.isArray(servizioData.aziende) ? servizioData.aziende[0] : servizioData.aziende;
      const veicolo = Array.isArray(servizioData.veicoli) ? servizioData.veicoli[0] : servizioData.veicoli;
      
      // Mappa passeggeri con tipo corretto
      const passeggeri = (servizioData.servizi_passeggeri || []).map((sp: any) => {
        const p = Array.isArray(sp.passeggeri) ? sp.passeggeri[0] : sp.passeggeri;
        
        // Se salva_in_database è true, usa i dati dal DB, altrimenti usa inline
        const usaDatiDB = sp.salva_in_database && p;
        
        const nomeCognome = usaDatiDB ? p.nome_cognome : (sp.nome_cognome_inline || '');
        const [nome = '', ...cognomeParts] = nomeCognome.split(' ');
        const cognome = cognomeParts.join(' ');
        
        return {
          id: sp.id,
          passeggero_id: sp.passeggero_id,
          nome_cognome: nomeCognome,
          nome,
          cognome,
          email: usaDatiDB ? p.email : sp.email_inline,
          telefono: usaDatiDB ? p.telefono : sp.telefono_inline,
          localita: usaDatiDB ? p.localita : sp.localita_inline,
          indirizzo: usaDatiDB ? p.indirizzo : sp.indirizzo_inline,
          azienda_id: p?.azienda_id || '',
          referente_id: p?.created_by_referente_id || '',
          orario_presa_personalizzato: sp.orario_presa_personalizzato,
          luogo_presa_personalizzato: sp.luogo_presa_personalizzato,
          destinazione_personalizzato: sp.destinazione_personalizzato,
          usa_indirizzo_personalizzato: sp.usa_indirizzo_personalizzato ?? false,
          salva_in_database: sp.salva_in_database ?? true,
        };
      });
      
      return {
        servizio: {
          ...servizioData,
          aziende: azienda,
          veicoli: veicolo,
        } as any, // Cast necessario per compatibilità con Servizio type
        passeggeri,
      };
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
  
  const { servizi: allServizi } = useServizi(); // Get all servizi for global indexing
  const { users } = useUsers();
  const { aziende } = useAziende();
  
  const [completaDialogOpen, setCompletaDialogOpen] = useState(false);
  const [consuntivaDialogOpen, setConsuntivaDialogOpen] = useState(false);
  
  const servizio = data?.servizio;
  const passeggeri = data?.passeggeri || [];
  
  // Veicolo
  const veicoloModello = servizio?.veicoli?.modello;
  
  // Calcola firma digitale dall'azienda del servizio, non dal profilo utente
  const firmaDigitaleAttiva = servizio?.aziende?.firma_digitale_attiva || false;
  
  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';
  
  // Admin e socio possono modificare servizi non ancora consuntivati
  // Altri utenti possono modificare solo servizi da assegnare
  const canBeEdited = isAdminOrSocio 
    ? servizio?.stato !== "consuntivato" && servizio?.stato !== "annullato"
    : servizio?.stato === "da_assegnare";
    
  const canBeCompleted = servizio?.stato === "assegnato";
  const canBeConsuntivato = servizio?.stato === "completato";
  
  // Function to get azienda name
  const getAziendaName = (aziendaId?: string) => {
    if (!aziendaId) return "Azienda sconosciuta";
    const azienda = aziende.find(a => a.id === aziendaId);
    return azienda ? azienda.nome : "Azienda sconosciuta";
  };

  // Function to get azienda object
  const getAzienda = (aziendaId?: string) => {
    if (!aziendaId) return undefined;
    return aziende.find(a => a.id === aziendaId);
  };
  
  // Function to get user name
  const getUserName = (users: any[], userId?: string) => {
    if (!userId) return null;
    const user = users.find(u => u.id === userId);
    if (!user) return null;
    return `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email;
  };

  // Get global index for the service
  const servizioIndex = servizio && allServizi ? 
    getServizioIndex(servizio.id, allServizi) : 
    0;
  
  return {
    servizio,
    passeggeri,
    users,
    isLoading,
    isError,
    error,
    canBeEdited,
    canBeCompleted,
    canBeConsuntivato,
    getAziendaName,
    getAzienda,
    getUserName,
    servizioIndex,
    allServizi,
    refetch,
    completaDialogOpen,
    setCompletaDialogOpen,
    consuntivaDialogOpen,
    setConsuntivaDialogOpen,
    firmaDigitaleAttiva,
    formatCurrency: formatCurrencyUtil,
    veicoloModello,
  };
}
