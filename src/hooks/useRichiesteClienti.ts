import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook per recuperare richieste clienti da confermare
 * Richieste = servizi con is_richiesta_cliente = true e stato in ('bozza', 'da_assegnare', 'richiesta_cliente')
 */
export function useRichiesteClienti() {
  return useQuery({
    queryKey: ['richieste-clienti'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('servizi')
        .select(`
          *,
          aziende:azienda_id(id, nome),
          profiles!servizi_assegnato_a_fkey(id, email, first_name, last_name),
          referente:referente_id(id, email, first_name, last_name),
          servizi_passeggeri(
            *,
            passeggeri(nome_cognome, email, telefono)
          )
        `)
        .eq('is_richiesta_cliente', true)
        .in('stato', ['bozza', 'da_assegnare', 'richiesta_cliente'])
        .order('data_servizio', { ascending: true })
        .order('orario_servizio', { ascending: true });

      if (error) {
        console.error('[useRichiesteClienti] Error:', error);
        throw error;
      }

      return data || [];
    },
  });
}

/**
 * Hook per singola richiesta cliente
 */
export function useRichiestaCliente(servizioId: string | undefined) {
  return useQuery({
    queryKey: ['richiesta-cliente', servizioId],
    queryFn: async () => {
      if (!servizioId) return null;

      const { data, error } = await supabase
        .from('servizi')
        .select(`
          *,
          aziende:azienda_id(id, nome),
          referente:referente_id(id, email, first_name, last_name),
          veicoli(id, modello, targa),
          servizi_passeggeri(
            *,
            passeggeri(nome_cognome, email, telefono, indirizzo, localita)
          ),
          servizi_email_notifiche(
            email_notifiche(id, email, nome)
          )
        `)
        .eq('id', servizioId)
        .eq('is_richiesta_cliente', true)
        .single();

      if (error) {
        console.error('[useRichiestaCliente] Error:', error);
        throw error;
      }

      return data;
    },
    enabled: !!servizioId,
  });
}
