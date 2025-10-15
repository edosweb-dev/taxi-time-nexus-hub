import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export const useServizioDetaglioCliente = (servizioId: string) => {
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: servizio, isLoading, error } = useQuery({
    queryKey: ["servizio-dettaglio-cliente", servizioId, user?.id],
    queryFn: async () => {
      console.log("[useServizioDetaglioCliente] Query starting:", {
        servizioId,
        userId: user?.id,
      });

      if (!servizioId || !user?.id) {
        console.log("[useServizioDetaglioCliente] Missing parameters, returning null");
        return null;
      }

      const { data, error } = await supabase
        .from("servizi")
        .select(`
          *,
          aziende:azienda_id (
            nome,
            partita_iva,
            email,
            telefono
          ),
          conducente:profiles!servizi_assegnato_a_fkey (
            id,
            first_name,
            last_name,
            email,
            telefono
          ),
          servizi_passeggeri (
            id,
            passeggeri (
              id,
              nome_cognome,
              email,
              telefono,
              localita,
              indirizzo
            )
          )
        `)
        .eq("id", servizioId)
        .eq("referente_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("[useServizioDetaglioCliente] Error:", error);
        throw error;
      }

      console.log("[useServizioDetaglioCliente] Query successful:", {
        found: !!data,
        servizioId: data?.id,
        stato: data?.stato,
      });

      return data;
    },
    enabled: !!servizioId && !!user?.id,
  });

  // Access control: redirect se non autorizzato
  useEffect(() => {
    // Condizioni per redirect:
    // 1. Query completata (!isLoading)
    // 2. User autenticato (user?.id)
    // 3. servizioId valido
    // 4. Nessun servizio trovato (!servizio)
    // 5. Nessun errore (se errore, lascia che error boundary lo gestisca)
    
    if (!isLoading && user?.id && servizioId && !servizio && !error) {
      console.warn("[useServizioDetaglioCliente] Access denied:", {
        servizioId,
        userId: user.id,
        reason: "Servizio not found or unauthorized",
      });
      
      // Delay di 300ms per evitare race condition durante hydration
      const timer = setTimeout(() => {
        navigate("/dashboard-cliente/servizi");
      }, 300);
      
      return () => clearTimeout(timer);
    }
    
    // Log stato corrente per debug
    if (!isLoading) {
      console.log("[useServizioDetaglioCliente] Access check:", {
        isLoading,
        hasUser: !!user?.id,
        hasServizioId: !!servizioId,
        hasServizio: !!servizio,
        hasError: !!error,
      });
    }
  }, [servizio, isLoading, user, navigate, servizioId, error]);

  return {
    servizio,
    isLoading,
    error,
  };
};
