
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface FeedbackData {
  tipo: string;
  pagina: string;
  messaggio: string;
  email?: string;
}

interface UpdateFeedbackData {
  status?: string;
  admin_comment?: string;
}

export function useFeedback() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();

  const createFeedback = async (data: FeedbackData) => {
    try {
      setIsSubmitting(true);
      
      const feedbackData = {
        ...data,
        user_id: user?.id || null,
        user_agent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('feedback')
        .insert([feedbackData]);

      if (error) throw error;

      toast({
        title: "Feedback inviato!",
        description: "Grazie per il tuo contributo. Il feedback è stato inviato con successo.",
      });

    } catch (error) {
      console.error('Errore invio feedback:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'invio del feedback.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFeedback = async (feedbackId: string, data: UpdateFeedbackData) => {
    try {
      setIsUpdating(true);
      
      const updateData: any = { ...data };
      
      if (data.status === 'risolto' || data.status === 'chiuso') {
        updateData.resolved_at = new Date().toISOString();
        updateData.resolved_by = user?.id;
      }

      const { error } = await supabase
        .from('feedback')
        .update(updateData)
        .eq('id', feedbackId);

      if (error) throw error;

      toast({
        title: "Feedback aggiornato!",
        description: "Le modifiche sono state salvate con successo.",
      });

    } catch (error) {
      console.error('Errore aggiornamento feedback:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento del feedback.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    createFeedback,
    updateFeedback,
    isSubmitting,
    isUpdating,
  };
}
