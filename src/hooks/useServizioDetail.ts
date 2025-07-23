
import { useState } from "react";
import { useServizio, useServizi } from "./useServizi";
import { useUsers } from "./useUsers";
import { useAziende } from "./useAziende";
import { getServizioIndex } from "@/components/servizi/utils/formatUtils";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency as formatCurrencyUtil } from "@/components/servizi/utils/formatUtils";
import { useFirmaDigitale } from "./useFirmaDigitale";
import { useAuth } from "./useAuth";

export function useServizioDetail(id?: string) {
  const { data, isLoading, isError, error, refetch } = useServizio(id);
  const { servizi: allServizi } = useServizi(); // Get all servizi for global indexing
  const { users } = useUsers();
  const { aziende } = useAziende();
  const { isFirmaDigitaleAttiva } = useFirmaDigitale();
  const { profile } = useAuth();
  
  const [completaDialogOpen, setCompletaDialogOpen] = useState(false);
  const [consuntivaDialogOpen, setConsuntivaDialogOpen] = useState(false);
  
  const servizio = data?.servizio;
  const passeggeri = data?.passeggeri || [];
  
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
    getUserName,
    servizioIndex,
    refetch,
    completaDialogOpen,
    setCompletaDialogOpen,
    consuntivaDialogOpen,
    setConsuntivaDialogOpen,
    firmaDigitaleAttiva: isFirmaDigitaleAttiva,
    formatCurrency: formatCurrencyUtil,
  };
}
