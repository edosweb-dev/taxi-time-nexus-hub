
import { useState } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useServiziPage } from "@/hooks/useServiziPage";
import { ServiziHeader } from "@/components/servizi/page/ServiziHeader";
import { ServiziContent } from "@/components/servizi/page/ServiziContent";
import { ServiziDialogManager } from "@/components/servizi/page/ServiziDialogManager";
import { Servizio } from "@/lib/types/servizi";

export default function ServiziPage() {
  const {
    servizi,
    isLoading,
    error,
    users,
    isAdminOrSocio,
    isMobile,
    refetch,
    handleNavigateToDetail,
    handleNavigateToNewServizio,
  } = useServiziPage();

  const [activeTab, setActiveTab] = useState<string>("da_assegnare");
  const [selectedServizio, setSelectedServizio] = useState<Servizio | null>(null);
  const [servizioPerCompletamento, setServizioPerCompletamento] = useState<Servizio | null>(null);
  const [servizioPerFirma, setServizioPerFirma] = useState<Servizio | null>(null);
  
  // Function to handle switching to calendar view
  const handleShowCalendarView = () => {
    setActiveTab("calendario");
  };

  // Function that gets called when a signature is saved successfully
  const handleFirmaSalvata = () => {
    // Refresh the list of services
    refetch();
  };

  // Dialog state handlers
  const handleSelectServizio = (servizio: Servizio) => {
    setSelectedServizio(servizio);
  };

  const handleCompleta = (servizio: Servizio) => {
    setServizioPerCompletamento(servizio);
  };

  const handleFirma = (servizio: Servizio) => {
    setServizioPerFirma(servizio);
  };

  const handleCloseAssegnazione = () => {
    setSelectedServizio(null);
  };

  const handleCloseCompletamento = (open: boolean) => {
    if (!open) setServizioPerCompletamento(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <ServiziHeader 
          onShowCalendarView={handleShowCalendarView}
          onCreateNewServizio={handleNavigateToNewServizio}
        />

        <ServiziContent
          servizi={servizi}
          users={users}
          isLoading={isLoading}
          error={error}
          isAdminOrSocio={isAdminOrSocio}
          isMobile={isMobile}
          onNavigateToDetail={handleNavigateToDetail}
          onNavigateToNewServizio={handleNavigateToNewServizio}
          onSelectServizio={handleSelectServizio}
          onCompleta={handleCompleta}
          onFirma={handleFirma}
        />
      </div>
      
      <ServiziDialogManager
        users={users}
        onFirmaSalvata={handleFirmaSalvata}
        selectedServizio={selectedServizio}
        servizioPerCompletamento={servizioPerCompletamento}
        servizioPerFirma={servizioPerFirma}
        onCloseAssegnazione={handleCloseAssegnazione}
        onCloseCompletamento={handleCloseCompletamento}
      />
    </MainLayout>
  );
}
