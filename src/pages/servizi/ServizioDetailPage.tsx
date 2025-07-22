
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
    servizioIndex,
  } = useServizioDetail(id);
  
  if (isLoading) {
    return <ServizioLoading />;
  }
  
  if (error || !servizio) {
    return <ServizioError />;
  }
  
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <ServizioHeader
            servizio={servizio}
            canBeEdited={canBeEdited}
            canBeCompleted={canBeCompleted}
            canBeConsuntivato={canBeConsuntivato}
            onCompleta={() => setCompletaDialogOpen(true)}
            onConsuntiva={() => setConsuntivaDialogOpen(true)}
            index={servizioIndex}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content - Takes 2/3 of space on large screens */}
          <div className="xl:col-span-2 space-y-6">
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

          {/* Sidebar - Takes 1/3 of space on large screens */}
          <div className="xl:col-span-1 space-y-6">
            {/* Firma Digitale Card */}
            <FirmaDigitaleSection 
              servizio={servizio} 
              firmaDigitaleAttiva={firmaDigitaleAttiva}
              refetch={refetch}
            />
            
            {/* Quick Actions Card */}
            <div className="bg-card border rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold">Azioni rapide</h3>
              <div className="space-y-2">
                {canBeCompleted && (
                  <button 
                    onClick={() => setCompletaDialogOpen(true)}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Completa servizio
                  </button>
                )}
                {canBeConsuntivato && (
                  <button 
                    onClick={() => setConsuntivaDialogOpen(true)}
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Consuntiva
                  </button>
                )}
                {canBeEdited && (
                  <button 
                    onClick={() => window.location.href = `/servizi/${servizio.id}/edit`}
                    className="w-full border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Modifica servizio
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
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
