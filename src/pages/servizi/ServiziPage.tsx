
import { MainLayout } from "@/components/layouts/MainLayout";
import { ServiziContent } from "@/components/servizi/page/ServiziContent";
import { ServiziHeader } from "@/components/servizi/page/ServiziHeader";
import { ServiziDialogManager } from "@/components/servizi/page/ServiziDialogManager";
import { useServiziPage } from "@/hooks/useServiziPage";
import { useState } from "react";
import { CalendarView } from "@/components/servizi/calendar/CalendarView";
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

  const [showCalendarView, setShowCalendarView] = useState(false);
  const [selectedServizio, setSelectedServizio] = useState<Servizio | null>(null);
  const [showAssegnazioneDialog, setShowAssegnazioneDialog] = useState(false);
  const [showCompletaDialog, setShowCompletaDialog] = useState(false);
  const [showFirmaDialog, setShowFirmaDialog] = useState(false);
  
  const handleShowCalendarView = () => {
    setShowCalendarView(!showCalendarView);
  };

  const handleSelectServizio = (servizio: Servizio) => {
    setSelectedServizio(servizio);
    setShowAssegnazioneDialog(true);
  };
  
  const handleCompleta = (servizio: Servizio) => {
    setSelectedServizio(servizio);
    setShowCompletaDialog(true);
  };
  
  const handleFirma = (servizio: Servizio) => {
    setSelectedServizio(servizio);
    setShowFirmaDialog(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <ServiziHeader 
          onShowCalendarView={handleShowCalendarView} 
          onCreateNewServizio={handleNavigateToNewServizio}
          isCalendarViewActive={showCalendarView}
        />
        
        {showCalendarView ? (
          <CalendarView 
            servizi={servizi}
            users={users}
            onNavigateToDetail={handleNavigateToDetail}
            allServizi={servizi}
          />
        ) : (
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
            allServizi={servizi}
          />
        )}
        
        <ServiziDialogManager 
          onRefetch={refetch}
          selectedServizio={selectedServizio}
          showAssegnazioneDialog={showAssegnazioneDialog}
          setShowAssegnazioneDialog={setShowAssegnazioneDialog}
          showCompletaDialog={showCompletaDialog}
          setShowCompletaDialog={setShowCompletaDialog}
          showFirmaDialog={showFirmaDialog}
          setShowFirmaDialog={setShowFirmaDialog}
          onClose={() => {
            setShowAssegnazioneDialog(false);
            setShowCompletaDialog(false);
            setShowFirmaDialog(false);
            setSelectedServizio(null);
          }}
        />
      </div>
    </MainLayout>
  );
}
