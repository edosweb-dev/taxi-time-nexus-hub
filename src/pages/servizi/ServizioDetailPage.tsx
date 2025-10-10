
import { useState } from "react";
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
import { AssignmentPopup } from "@/components/servizi/assegnazione/AssignmentPopup";
import { useAuth } from "@/contexts/AuthContext";

export default function ServizioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { users } = useUsers();
  const { profile } = useAuth();
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
    allServizi,
  } = useServizioDetail(id);

  const [assegnazioneSheetOpen, setAssegnazioneSheetOpen] = useState(false);
  
  const isAdmin = profile?.role === 'admin' || profile?.role === 'socio';
  
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
        <div className="mobile-servizio-detail px-4 pb-32 sm:pb-8">
          <MobileServizioHero
            servizio={mobileServizioData} 
            isAdmin={isAdmin}
            onAssegnaServizio={() => setAssegnazioneSheetOpen(true)}
          />
          <MobileServizioSections 
            servizio={servizio} 
            passeggeri={passeggeri}
            formatCurrency={formatCurrency}
            users={users}
            getUserName={getUserName}
          />
          
          {/* Mobile Action Buttons - Sticky at bottom */}
          {(canBeCompleted || canBeConsuntivato || canBeEdited) && (
            <div className="fixed bottom-16 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-4 z-40">
              <div className="flex gap-2">
                {canBeCompleted && (
                  <Button 
                    onClick={() => setCompletaDialogOpen(true)}
                    className="flex-1 h-10 text-sm font-medium"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Completa
                  </Button>
                )}
                
                {canBeConsuntivato && (
                  <Button 
                    onClick={() => setConsuntivaDialogOpen(true)}
                    variant="secondary"
                    className="flex-1 h-10 text-sm font-medium"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Consuntiva
                  </Button>
                )}
                
                {canBeEdited && (
                  <Button 
                    onClick={() => navigate(`/servizi/${servizio.id}/edit`)}
                    variant="outline"
                    className="flex-1 h-10 text-sm font-medium"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Modifica
                  </Button>
                )}
              </div>
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

        {/* Assignment Popup - ottimizzato per mobile e desktop */}
        <AssignmentPopup
          open={assegnazioneSheetOpen}
          onOpenChange={setAssegnazioneSheetOpen}
          onClose={() => {
            setAssegnazioneSheetOpen(false);
            refetch();
          }}
          servizio={servizio}
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
            allServizi={allServizi || []}
            onCompleta={() => setCompletaDialogOpen(true)}
            onConsuntiva={() => setConsuntivaDialogOpen(true)}
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
