
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          {/* Main Content Area - 3/4 width on large screens */}
          <div className="lg:col-span-3 space-y-6">
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
          </div>

          {/* Sidebar Area - 1/4 width on large screens */}
          <div className="lg:col-span-1 space-y-6">
            {/* Service Status & Actions Card */}
            <div className="bg-card border rounded-lg p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Stato attuale</div>
                  {(() => {
                    switch (servizio.stato) {
                      case 'da_assegnare':
                        return <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">Da assegnare</div>;
                      case 'assegnato':
                        return <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Assegnato</div>;
                      case 'completato':
                        return <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Completato</div>;
                      case 'consuntivato':
                        return <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">Consuntivato</div>;
                      default:
                        return <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">{servizio.stato}</div>;
                    }
                  })()}
                </div>
                
                {(canBeCompleted || canBeConsuntivato || canBeEdited) && (
                  <div className="pt-4 border-t">
                    <div className="text-sm font-medium text-muted-foreground mb-3">Azioni disponibili</div>
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
                )}
              </div>
            </div>

            {/* Passengers Summary Card */}
            <div className="bg-card border rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Passeggeri</h3>
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    {passeggeri.length}
                  </span>
                </div>
                
                {passeggeri.length === 0 ? (
                  <div className="text-center py-6">
                    <Users className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nessun passeggero</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {passeggeri.map((passeggero: any, index: number) => (
                      <div key={passeggero.id} className="bg-muted/30 rounded-lg p-3">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium min-w-fit">
                            #{index + 1}
                          </span>
                          <div className="font-medium text-sm truncate">{passeggero.nome_cognome}</div>
                        </div>
                        
                        {(passeggero.email || passeggero.telefono) && (
                          <div className="space-y-1 text-xs pl-6">
                            {passeggero.email && (
                              <div className="text-muted-foreground truncate">{passeggero.email}</div>
                            )}
                            {passeggero.telefono && (
                              <div className="text-muted-foreground">{passeggero.telefono}</div>
                            )}
                          </div>
                        )}
                        
                        {passeggero.usa_indirizzo_personalizzato && (
                          <div className="mt-2 pt-2 border-t border-muted text-xs">
                            <div className="text-muted-foreground font-medium mb-1">Personalizzazioni:</div>
                            {passeggero.luogo_presa_personalizzato && (
                              <div className="text-muted-foreground truncate">
                                📍 {passeggero.luogo_presa_personalizzato}
                              </div>
                            )}
                            {passeggero.orario_presa_personalizzato && (
                              <div className="text-muted-foreground">
                                🕒 {passeggero.orario_presa_personalizzato}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Statistiche rapide</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Passeggeri</span>
                  <span className="font-medium">{passeggeri.length}</span>
                </div>
                
                {servizio.incasso_ricevuto && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Incasso</span>
                    <span className="font-medium text-green-600">{formatCurrency(servizio.incasso_ricevuto)}</span>
                  </div>
                )}
                
                {servizio.ore_lavorate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Ore lavorate</span>
                    <span className="font-medium">{servizio.ore_lavorate}h</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Metodo pagamento</span>
                  <span className="font-medium text-xs">{servizio.metodo_pagamento || "Non specificato"}</span>
                </div>
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
