
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useServizioDetail } from "@/hooks/useServizioDetail";
import { useUsers } from "@/hooks/useUsers";
import { getUserName } from "@/components/servizi/utils";
import { FirmaServizio } from "@/components/firma/FirmaServizio";
import { FirmaDisplay } from "@/components/firma/FirmaDisplay";
import { CompletaServizioDialog } from "@/components/servizi/CompletaServizioDialog";
import { ConsuntivaServizioDialog } from "@/components/servizi/ConsuntivaServizioDialog";
import { ServizioHeader } from "@/components/servizi/dettaglio/ServizioHeader";
import { ServizioInfoTab } from "@/components/servizi/dettaglio/ServizioInfoTab";
import { ServizioPasseggeriTab } from "@/components/servizi/dettaglio/ServizioPasseggeriTab";
import { ServizioLoading, ServizioError } from "@/components/servizi/dettaglio/ServizioLoadingError";

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
      <div className="space-y-6">
        <ServizioHeader
          servizio={servizio}
          canBeEdited={canBeEdited}
          canBeCompleted={canBeCompleted}
          canBeConsuntivato={canBeConsuntivato}
          onCompleta={() => setCompletaDialogOpen(true)}
          onConsuntiva={() => setConsuntivaDialogOpen(true)}
        />
        
        {/* Digital signature action */}
        {servizio.stato === 'assegnato' && firmaDigitaleAttiva && !servizio.firma_url && (
          <div className="mb-4 flex justify-end">
            <FirmaServizio 
              servizioId={servizio.id}
              onFirmaSalvata={refetch}
            />
          </div>
        )}
        
        {/* Show signature if available */}
        {servizio.firma_url && (
          <div className="mb-6">
            <FirmaDisplay 
              firmaUrl={servizio.firma_url} 
              firmaTimestamp={servizio.firma_timestamp}
            />
          </div>
        )}
        
        <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="info">Informazioni</TabsTrigger>
            <TabsTrigger value="passeggeri">
              Passeggeri ({passeggeri.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-6">
            <ServizioInfoTab 
              servizio={servizio}
              passeggeri={passeggeri}
              users={users}
              getAziendaName={getAziendaName}
              getUserName={getUserName}
              formatCurrency={formatCurrency}
            />
          </TabsContent>
          
          <TabsContent value="passeggeri" className="space-y-4">
            <ServizioPasseggeriTab
              passeggeri={passeggeri}
              servizioPresa={servizio.indirizzo_presa}
              servizioDestinazione={servizio.indirizzo_destinazione}
              servizioOrario={servizio.orario_servizio}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Completa servizio dialog */}
      <CompletaServizioDialog
        open={completaDialogOpen}
        onOpenChange={setCompletaDialogOpen}
        servizioId={servizio.id}
        metodoDefault={servizio.metodo_pagamento}
        onComplete={refetch}
      />

      {/* Consuntiva servizio dialog */}
      <ConsuntivaServizioDialog
        open={consuntivaDialogOpen}
        onOpenChange={setConsuntivaDialogOpen}
        servizioId={servizio.id}
        isContanti={servizio.metodo_pagamento === 'Contanti'}
        incassoRicevuto={servizio.incasso_ricevuto}
        oreLavorate={servizio.ore_lavorate}
        onComplete={refetch}
      />
    </MainLayout>
  );
}
