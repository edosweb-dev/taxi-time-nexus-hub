
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { salvaFirmaDigitale } from '@/lib/api/servizi/gestioneFirmaDigitale';
import { useAuth } from '@/contexts/AuthContext';

export function useFirmaDigitale() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  const uploadFirma = async (servizioId: string, firmaBase64: string) => {
    try {
      setIsLoading(true);
      
      // Verifica che l'utente sia autenticato
      if (!profile || !profile.id) {
        console.error("Utente non autenticato");
        toast({
          title: "Errore di autenticazione",
          description: "Non sei autenticato. Effettua l'accesso e riprova.",
          variant: "destructive"
        });
        return { success: false, error: new Error("Utente non autenticato") };
      }
      
      console.log("Inizio upload firma...");
      if (!firmaBase64) {
        console.error("Firma non fornita");
        toast({
          title: "Errore",
          description: "Firma non fornita",
          variant: "destructive"
        });
        return { success: false, error: new Error("Firma non fornita") };
      }
      
      // Verifica ulteriormente la validità della firma
      if (!firmaBase64.startsWith('data:image/png;base64,')) {
        console.error("Formato firma non valido");
        toast({
          title: "Errore",
          description: "Formato firma non valido",
          variant: "destructive"
        });
        return { success: false, error: new Error("Formato firma non valido") };
      }
      
      if (firmaBase64.length < 1000) {
        console.error("Firma troppo piccola o vuota:", firmaBase64.length);
        toast({
          title: "Errore",
          description: "Firma troppo semplice, prova a firmare nuovamente",
          variant: "destructive"
        });
        return { success: false, error: new Error("Firma troppo semplice") };
      }
      
      // Verifica la parte base64 (dopo la virgola)
      const base64Content = firmaBase64.split(',')[1];
      if (!base64Content || base64Content.length < 100) {
        console.error("Contenuto base64 non valido o troppo piccolo");
        toast({
          title: "Errore",
          description: "Firma non valida, prova a firmare nuovamente",
          variant: "destructive"
        });
        return { success: false, error: new Error("Contenuto firma non valido") };
      }
      
      console.log("Dimensione dati firma:", firmaBase64.length, "bytes");
      
      const result = await salvaFirmaDigitale(servizioId, firmaBase64);
      
      if (!result.success) {
        throw result.error;
      }
      
      // Invalida le query per aggiornare i dati
      queryClient.invalidateQueries({ queryKey: ['servizio', servizioId] });
      queryClient.invalidateQueries({ queryKey: ['servizi'] });
      
      toast({
        title: "Successo",
        description: "Firma salvata con successo",
      });
      return { success: true, url: result.url, timestamp: result.timestamp };
      
    } catch (error: any) {
      console.error('Errore nel salvataggio della firma:', error);
      
      // Gestione specifica degli errori di autenticazione
      if (error?.message?.includes('autenticazione') || error?.message?.includes('sessione') || error?.message?.includes('login')) {
        toast({
          title: "Errore di autenticazione",
          description: "La tua sessione potrebbe essere scaduta. Effettua nuovamente l'accesso.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Errore",
          description: `Errore nel salvataggio della firma: ${error.message || 'Errore sconosciuto'}`,
          variant: "destructive"
        });
      }
      
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    uploadFirma,
    isLoading
  };
}
