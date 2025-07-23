
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useServizioDetail } from "@/hooks/useServizioDetail";
import { useUsers } from "@/hooks/useUsers";
import { getUserName } from "@/components/servizi/utils/userUtils";
import { Users } from "lucide-react";
import { ServizioHeader } from "@/components/servizi/dettaglio/ServizioHeader";
import { ServizioLoading, ServizioError } from "@/components/servizi/dettaglio/ServizioLoadingError";
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
      <div className="space-y-6">
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

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area - Full width on large screens */}
          <div className="lg:col-span-4 space-y-6">
            <ServizioTabs
              servizio={servizio}
              passeggeri={passeggeri}
              users={users}
              activeTab=""
              onTabChange={() => {}}
              getAziendaName={getAziendaName}
              getUserName={getUserName}
              formatCurrency={formatCurrency}
              firmaDigitaleAttiva={firmaDigitaleAttiva}
            />
            
            {/* Action Buttons - Mobile/Bottom */}
            <div className="lg:hidden bg-card border rounded-lg p-6">
              <div className="text-sm font-medium text-muted-foreground mb-3">Azioni disponibili</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {canBeCompleted && (
                  <button 
                    onClick={() => setCompletaDialogOpen(true)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Completa servizio
                  </button>
                )}
                {canBeConsuntivato && (
                  <button 
                    onClick={() => setConsuntivaDialogOpen(true)}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Consuntiva
                  </button>
                )}
                {canBeEdited && (
                  <button 
                    onClick={() => window.location.href = `/servizi/${servizio.id}/edit`}
                    className="border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Modifica servizio
                  </button>
                )}
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
      </div>
    </MainLayout>
  );
}
