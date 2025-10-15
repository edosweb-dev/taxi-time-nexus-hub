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
      if (!servizioId || !user?.id) return null;

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
          referente:referente_id (
            id,
            first_name,
            last_name,
            email
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
        .eq("referente_id", user.id) // Access control: solo proprietario
        .maybeSingle();

      if (error) {
        console.error("[useServizioDetaglioCliente] Error:", error);
        throw error;
      }

      return data;
    },
    enabled: !!servizioId && !!user?.id,
  });

  // Access control: redirect se non autorizzato
  useEffect(() => {
    if (!isLoading && !servizio && user?.id) {
      console.warn("[useServizioDetaglioCliente] Access denied - redirecting to dashboard");
      navigate("/dashboard-cliente/servizi");
    }
  }, [servizio, isLoading, user, navigate]);

  return {
    servizio,
    isLoading,
    error,
  };
};
