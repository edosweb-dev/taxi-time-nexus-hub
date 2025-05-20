
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGenerateReport } from '../useGenerateReport';
import { toast } from '@/components/ui/use-toast';
import { ReportFormValues } from './types';

export const useReportFormSubmit = (
  servizi: any[],
  onCancel: () => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const { profile } = useAuth();
  const { generateReport, checkBucketExists } = useGenerateReport();

  const handleSubmit = async (data: ReportFormValues) => {
    console.log("Form submitted, starting report generation with data:", data);
    
    // Set form submitting state to prevent dialog closure
    const formElement = document.querySelector('form');
    if (formElement) {
      formElement.dataset.submitting = 'true';
    }
    
    setIsLoading(true);
    
    try {
      // Use all servizi IDs
      const serviziIds = servizi.map(s => s.id);
      
      if (serviziIds.length === 0) {
        toast({
          title: "Errore",
          description: 'Non ci sono servizi disponibili per generare il report.',
          variant: "destructive",
        });
        setIsLoading(false);
        
        // Reset form submitting state
        if (formElement) {
          formElement.dataset.submitting = 'false';
        }
        return;
      }
      
      console.log("Generando report con i seguenti parametri:", {
        aziendaId: data.aziendaId,
        referenteId: data.referenteId,
        month: parseInt(data.month),
        year: parseInt(data.year),
        serviziCount: serviziIds.length
      });
      
      // Aggiungiamo il log strategico prima della chiamata
      console.log("[DEBUG] Chiamo generateReport con:", {
        aziendaId: data.aziendaId,
        referenteId: data.referenteId,
        month: parseInt(data.month),
        year: parseInt(data.year),
        serviziIds,
        createdBy: profile?.id || ''
      });
      
      const result = await generateReport({
        aziendaId: data.aziendaId,
        referenteId: data.referenteId,
        month: parseInt(data.month),
        year: parseInt(data.year),
        serviziIds: serviziIds,
        createdBy: profile?.id || ''
      });
      
      if (result) {
        console.log("Report generato con successo, chiusura del form");
        toast({
          title: "Successo",
          description: "Il report è stato generato con successo. Puoi scaricarlo dalla sezione Reports."
        });
        onCancel(); // Close the form after successful generation
      }
    } catch (error: any) {
      console.error('Error generating report:', error);
      
      // Gestione specifica dell'errore di bucket mancante
      if (error.message && error.message.includes('bucket')) {
        toast({
          title: "Errore nella generazione del report",
          description: "Problema con il bucket di storage. Si è tentato di crearlo automaticamente, riprova l'operazione.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Errore nella generazione del report",
          description: error?.message || 'Si è verificato un errore nella generazione del report.',
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
      // Reset form submitting state
      const form = document.querySelector('form');
      if (form) {
        form.dataset.submitting = 'false';
      }
    }
  };

  return {
    isLoading,
    handleSubmit
  };
};
