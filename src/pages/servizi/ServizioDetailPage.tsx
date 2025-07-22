
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
              activeTab=""
              onTabChange={() => {}}
              getAziendaName={getAziendaName}
              getUserName={getUserName}
              formatCurrency={formatCurrency}
            />
          </div>

          {/* Sidebar - Takes 1/3 of space on large screens */}
          <div className="xl:col-span-1 space-y-6">
            {/* Passengers Card */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">👥 Passeggeri</h3>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {passeggeri.length}
                </span>
              </div>
              
              {passeggeri.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Nessun passeggero registrato</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {passeggeri.map((passeggero: any, index: number) => (
                    <div key={passeggero.id} className="bg-muted/30 rounded-lg p-4 border-l-4 border-primary/20">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">#{index + 1}</span>
                        <div className="font-medium text-sm">{passeggero.nome_cognome}</div>
                      </div>
                      
                      <div className="space-y-1 text-xs">
                        {passeggero.email && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Email:</span>
                            <span className="truncate ml-2">{passeggero.email}</span>
                          </div>
                        )}
                        
                        {passeggero.telefono && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tel:</span>
                            <span>{passeggero.telefono}</span>
                          </div>
                        )}
                        
                        {passeggero.usa_indirizzo_personalizzato && (
                          <div className="pt-1 border-t border-muted">
                            <div className="text-xs font-medium text-muted-foreground mb-1">Personalizzato:</div>
                            
                            {passeggero.luogo_presa_personalizzato && (
                              <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">Presa:</span>
                                <span className="text-xs truncate">{passeggero.luogo_presa_personalizzato}</span>
                              </div>
                            )}
                            
                            {passeggero.orario_presa_personalizzato && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Orario:</span>
                                <span>{passeggero.orario_presa_personalizzato}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Quick Actions Card */}
            <div className="bg-card border rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold">⚡ Azioni rapide</h3>
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
