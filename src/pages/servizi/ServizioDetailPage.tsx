
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useServizioDetail } from "@/hooks/useServizioDetail";
import { useUsers } from "@/hooks/useUsers";
import { useIsMobile } from "@/hooks/use-mobile";
import { getUserName } from "@/components/servizi/utils/userUtils";
import { Button } from "@/components/ui/button";
import { CheckCircle2, FileText, Edit } from "lucide-react";
import { ServizioHeader } from "@/components/servizi/dettaglio/ServizioHeader";
import { ServizioLoading, ServizioError } from "@/components/servizi/dettaglio/ServizioLoadingError";
import { ServizioTabs } from "@/components/servizi/dettaglio/ServizioTabs";
import { ServizioDialogs } from "@/components/servizi/dettaglio/ServizioDialogs";
import { MobileServizioHero } from "@/components/servizio/mobile/MobileServizioHero";
import { MobileServizioSections } from "@/components/servizio/mobile/MobileServizioSections";

export default function ServizioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { users } = useUsers();
  const isMobile = useIsMobile();
  const {
    servizio,
    passeggeri,
    users: detailUsers,
    getAzienda,
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

  // Prepare mobile-optimized service data
  const mobileServizioData = {
    id: servizio.id,
    cliente: { 
      nome: getAziendaName(servizio.azienda_id), 
      telefono: undefined // Add telefono field if available in data
    },
    data: new Date(servizio.data_servizio),
    orario: servizio.orario_servizio,
    stato: servizio.stato,
    autista: servizio.assegnato_a ? {
      nome: getUserName(users, servizio.assegnato_a) || 'Autista sconosciuto',
      telefono: undefined, // Add telefono field if available
      avatar: undefined // Add avatar field if available
    } : undefined,
    pickup: { 
      indirizzo: servizio.indirizzo_presa, 
      citta: servizio.citta_presa || '' 
    },
    destinazione: { 
      indirizzo: servizio.indirizzo_destinazione, 
      citta: servizio.citta_destinazione || '' 
    },
    durata: undefined, // Add durata field if available
    distanza: undefined // Add distanza field if available
  };

  // Mobile-first layout
  if (isMobile) {
    return (
      <MainLayout 
        title="Dettaglio Servizio"
        headerProps={{
          showBackButton: true,
          onBackClick: () => navigate('/servizi')
        }}
      >
        <div className="mobile-servizio-detail px-4">
          <MobileServizioHero servizio={mobileServizioData} />
          <MobileServizioSections 
            servizio={servizio} 
            passeggeri={passeggeri}
            formatCurrency={formatCurrency}
          />
          
          {/* Mobile Action Buttons - Sticky at bottom */}
          {(canBeCompleted || canBeConsuntivato || canBeEdited) && (
            <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-4 pb-safe-bottom z-50">
              <div className="max-w-md mx-auto space-y-3">
                <div className="text-xs font-medium text-muted-foreground text-center mb-3">
                  Azioni disponibili
                </div>
                
                <div className="flex flex-col gap-2">
                  {canBeCompleted && (
                    <Button 
                      onClick={() => setCompletaDialogOpen(true)}
                      size="lg"
                      className="w-full h-12 text-base font-medium"
                    >
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Completa servizio
                    </Button>
                  )}
                  
                  {canBeConsuntivato && (
                    <Button 
                      onClick={() => setConsuntivaDialogOpen(true)}
                      variant="secondary"
                      size="lg"
                      className="w-full h-12 text-base font-medium"
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      Consuntiva servizio
                    </Button>
                  )}
                  
                  {canBeEdited && (
                    <Button 
                      onClick={() => navigate(`/servizi/${servizio.id}/edit`)}
                      variant="outline"
                      size="lg"
                      className="w-full h-12 text-base font-medium"
                    >
                      <Edit className="h-5 w-5 mr-2" />
                      Modifica servizio
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Spacer to prevent content overlap */}
              <div className="h-20" />
            </div>
          )}
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

  // Desktop layout (original)
  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6 px-2 md:px-0">
        {/* Header Section - Optimized for mobile */}
        <div className="mb-4 md:mb-8">
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

        {/* Main Content - Desktop */}
        <div className="space-y-4 md:space-y-6">
          <ServizioTabs
            servizio={servizio}
            passeggeri={passeggeri}
            users={users}
            activeTab=""
            onTabChange={() => {}}
            getAziendaName={getAziendaName}
            getAzienda={getAzienda}
            getUserName={getUserName}
            formatCurrency={formatCurrency}
            firmaDigitaleAttiva={firmaDigitaleAttiva}
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
      </div>
    </MainLayout>
  );
}
