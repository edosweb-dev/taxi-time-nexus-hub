import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { EmailNotifica, EmailNotificaFormData } from "@/lib/types/emailNotifiche";
import { toast } from "sonner";

export function useEmailNotifiche(aziendaId?: string) {
  const queryClient = useQueryClient();

  const { data: emailNotifiche = [], isLoading, error } = useQuery({
    queryKey: ['email-notifiche', aziendaId],
    queryFn: async () => {
      if (!aziendaId) return [];
      
      const { data, error } = await supabase
        .from('email_notifiche')
        .select('*')
        .eq('attivo', true)
        .eq('azienda_id', aziendaId)
        .order('nome');
      
      if (error) {
        throw error;
      }
      
      return data as EmailNotifica[];
    },
    enabled: !!aziendaId,
  });

  const createEmailNotifica = useMutation({
    mutationFn: async (data: EmailNotificaFormData) => {
      const user = (await supabase.auth.getUser()).data.user;
      
      // Fetch profilo per determinare il ruolo
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();

      // Costruisci oggetto insert
      const insertData: Record<string, unknown> = {
        nome: data.nome,
        email: data.email,
        azienda_id: data.azienda_id,
        note: data.note,
        created_by: user?.id,
      };

      // Solo i clienti impostano referente_id per isolamento dati
      // Admin/Socio possono creare email per qualsiasi azienda
      if (profile?.role === 'cliente') {
        insertData.referente_id = user?.id;
      }

      console.log('[useEmailNotifiche] Creating email with:', insertData);

      const { data: result, error } = await supabase
        .from('email_notifiche')
        .insert([insertData as any])
        .select()
        .single();
      
      if (error) {
        console.error('[useEmailNotifiche] Error creating email:', error);
        throw error;
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-notifiche'] });
      toast.success("Indirizzo email aggiunto con successo");
    },
    onError: (error: any) => {
      toast.error(`Errore nell'aggiunta dell'email: ${error.message}`);
    },
  });

  const deleteEmailNotifica = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_notifiche')
        .update({ attivo: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-notifiche'] });
      toast.success("Indirizzo email rimosso");
    },
    onError: (error: any) => {
      toast.error(`Errore nella rimozione: ${error.message}`);
    },
  });

  return {
    emailNotifiche,
    isLoading,
    error,
    createEmailNotifica: createEmailNotifica.mutate,
    deleteEmailNotifica: deleteEmailNotifica.mutate,
    isCreating: createEmailNotifica.isPending,
    isDeleting: deleteEmailNotifica.isPending,
  };
}