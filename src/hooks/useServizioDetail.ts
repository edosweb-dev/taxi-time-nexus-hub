
import { useState, useEffect } from "react";
import { useServizio } from "@/hooks/useServizi";
import { useAziende } from "@/hooks/useAziende";
import { useAuth } from "@/contexts/AuthContext";
import { Servizio } from "@/lib/types/servizi";

export function useServizioDetail(id?: string) {
  const { data, isLoading, error, refetch } = useServizio(id);
  const { aziende } = useAziende();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("info");
  const [completaDialogOpen, setCompletaDialogOpen] = useState(false);
  const [consuntivaDialogOpen, setConsuntivaDialogOpen] = useState(false);
  const [firmaDigitaleAttiva, setFirmaDigitaleAttiva] = useState(false);
  
  const servizio = data?.servizio;
  const passeggeri = data?.passeggeri || [];
  
  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';
  const isAssegnatoToMe = profile?.id === servizio?.assegnato_a;
  
  useEffect(() => {
    if (servizio && aziende.length > 0) {
      const azienda = aziende.find(a => a.id === servizio.azienda_id);
      setFirmaDigitaleAttiva(!!azienda?.firma_digitale_attiva);
    }
  }, [servizio, aziende]);
  
  // Get company name by ID
  const getAziendaName = (aziendaId?: string) => {
    if (!aziendaId) return "Azienda sconosciuta";
    const azienda = aziende.find(a => a.id === aziendaId);
    return azienda ? azienda.nome : "Azienda sconosciuta";
  };
  
  // Service can be edited by admin/socio if not yet completed or consuntivato
  const canBeEdited = isAdminOrSocio && 
    servizio && 
    (servizio.stato !== 'completato' && servizio.stato !== 'consuntivato');
  
  // Check if service can be completed (only by assigned user)
  const canBeCompleted = servizio && 
    servizio.stato === 'assegnato' && 
    (isAssegnatoToMe || isAdminOrSocio);
  
  // Check if service can be consuntivato (only by admin/socio after completion)
  const canBeConsuntivato = isAdminOrSocio && 
    servizio && 
    servizio.stato === 'completato';
  
  // Format currency values
  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "-";
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
  };

  return {
    servizio,
    passeggeri,
    isLoading,
    error,
    refetch,
    activeTab,
    setActiveTab,
    completaDialogOpen,
    setCompletaDialogOpen,
    consuntivaDialogOpen,
    setConsuntivaDialogOpen,
    firmaDigitaleAttiva,
    isAdminOrSocio,
    canBeEdited,
    canBeCompleted,
    canBeConsuntivato,
    getAziendaName,
    formatCurrency,
  };
}
