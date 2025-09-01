import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { EmailNotifica, EmailNotificaFormData } from "@/lib/types/emailNotifiche";
import { toast } from "sonner";

export function useEmailNotifiche() {
  const queryClient = useQueryClient();

  const { data: emailNotifiche = [], isLoading, error } = useQuery({
    queryKey: ['email-notifiche'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_notifiche')
        .select('*')
        .eq('attivo', true)
        .order('nome');
      
      if (error) {
        throw error;
      }
      
      return data as EmailNotifica[];
    },
  });

  const createEmailNotifica = useMutation({
    mutationFn: async (data: EmailNotificaFormData) => {
      const { data: result, error } = await supabase
        .from('email_notifiche')
        .insert({
          nome: data.nome,
          email: data.email,
          note: data.note,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
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