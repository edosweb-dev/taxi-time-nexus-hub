
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useServizioDetail } from "@/hooks/useServizioDetail";
import { useUsers } from "@/hooks/useUsers";
import { getUserName } from "@/components/servizi/utils/userUtils";
import { ServizioHeader } from "@/components/servizi/dettaglio/ServizioHeader";
import { ServizioLoading, ServizioError } from "@/components/servizi/dettaglio/ServizioLoadingError";
import { FirmaDigitaleSection } from "@/components/servizi/dettaglio/FirmaDigitaleSection";
import { ServizioTabs } from "@/components/servizi/dettaglio/ServizioTabs";
import { ServizioDialogs } from "@/components/servizi/dettaglio/ServizioDialogs";

export default function ServizioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { users } = useUsers();
  const {
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
    canBeEdited,
    canBeCompleted,
    canBeConsuntivato,
    getAziendaName,
    formatCurrency,
  } = useServizioDetail(id);
  
  if (isLoading) {
    return <ServizioLoading />;
  }
  
  if (error || !servizio) {
    return <ServizioError />;
  }
  
  return (
    <MainLayout>
      <div className="space-y-4">
        <ServizioHeader
          servizio={servizio}
          canBeEdited={canBeEdited}
          canBeCompleted={canBeCompleted}
          canBeConsuntivato={canBeConsuntivato}
          onCompleta={() => setCompletaDialogOpen(true)}
          onConsuntiva={() => setConsuntivaDialogOpen(true)}
        />
        
        {/* Firma section shown only when needed */}
        <FirmaDigitaleSection 
          servizio={servizio} 
          firmaDigitaleAttiva={firmaDigitaleAttiva}
          refetch={refetch}
        />
        
        <ServizioTabs
          servizio={servizio}
          passeggeri={passeggeri}
          users={users}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          getAziendaName={getAziendaName}
          getUserName={getUserName}
          formatCurrency={formatCurrency}
        />
      </div>

      <ServizioDialogs
        servizio={servizio}
        completaDialogOpen={completaDialogOpen}
        consuntivaDialogOpen={consuntivaDialogOpen}
        onCompletaOpenChange={setCompletaDialogOpen}
        onConsuntivaOpenChange={setConsuntivaDialogOpen}
        onComplete={refetch}
        users={users}
      />
    </MainLayout>
  );
}
