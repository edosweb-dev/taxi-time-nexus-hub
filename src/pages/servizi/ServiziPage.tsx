import { MainLayout } from "@/components/layouts/MainLayout";
import { ServiziContent } from "@/components/servizi/page/ServiziContent";
import { ServiziHeader } from "@/components/servizi/page/ServiziHeader";
import { ServiziDialogManager } from "@/components/servizi/page/ServiziDialogManager";
import { useServiziPage } from "@/hooks/useServiziPage";
import { useState } from "react";
import { CalendarView } from "@/components/servizi/calendar/CalendarView";

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
  
  const handleShowCalendarView = () => {
    setShowCalendarView(!showCalendarView);
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
            onSelectServizio={(servizio) => {}}
            onCompleta={(servizio) => {}}
            onFirma={(servizio) => {}}
            allServizi={servizi}
          />
        )}
        
        <ServiziDialogManager 
          onRefetch={refetch}
        />
      </div>
    </MainLayout>
  );
}
