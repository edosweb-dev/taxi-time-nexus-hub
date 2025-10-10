
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useServizioDetail } from "@/hooks/useServizioDetail";
import { useUsers } from "@/hooks/useUsers";
import { useIsMobile } from "@/hooks/use-mobile";
import { getUserName } from "@/components/servizi/utils/userUtils";
import { Button } from "@/components/ui/button";
import { CheckCircle2, FileText, Edit, Users, Edit3, MoreVertical, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ServizioHeader } from "@/components/servizi/dettaglio/ServizioHeader";
import { ServizioLoading, ServizioError } from "@/components/servizi/dettaglio/ServizioLoadingError";
import { ServizioTabs } from "@/components/servizi/dettaglio/ServizioTabs";
import { ServizioDialogs } from "@/components/servizi/dettaglio/ServizioDialogs";
import { MobileServizioHero } from "@/components/servizio/mobile/MobileServizioHero";
import { MobileServizioSections } from "@/components/servizio/mobile/MobileServizioSections";
import { AssignmentPopup } from "@/components/servizi/assegnazione/AssignmentPopup";
import { FirmaCliente } from "@/components/servizi/FirmaCliente";
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
  const [showFirmaClienteDialog, setShowFirmaClienteDialog] = useState(false);
  
  const isAdmin = profile?.role === 'admin' || profile?.role === 'socio';
  
  const canRequestSignature = 
    servizio?.stato === 'assegnato' && 
    firmaDigitaleAttiva && 
    !servizio?.firma_url &&
    (profile?.role === 'admin' || 
     profile?.role === 'socio' || 
     servizio?.assegnato_a === profile?.id);
  
  // Can modify only if not signed yet and not completed/consuntivated
  const canModify = 
    !servizio?.firma_url && 
    servizio?.stato !== 'completato' && 
    servizio?.stato !== 'consuntivato' &&
    (profile?.role === 'admin' || 
     profile?.role === 'socio' || 
     servizio?.created_by === profile?.id);
  
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
          onBackClick: () => navigate('/servizi'),
          rightActions: (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Modifica - Solo se non firmato e non completato */}
                {canModify && (
                  <DropdownMenuItem onClick={() => navigate(`/servizi/${servizio.id}/edit`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifica Servizio
                  </DropdownMenuItem>
                )}
                
                {/* Consuntiva */}
                {canBeConsuntivato && (
                  <DropdownMenuItem onClick={() => setConsuntivaDialogOpen(true)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Consuntiva
                  </DropdownMenuItem>
                )}
                
                {/* Assegna */}
                {servizio.stato === 'da_assegnare' && isAdmin && (
                  <DropdownMenuItem onClick={() => setAssegnazioneSheetOpen(true)}>
                    <Users className="h-4 w-4 mr-2" />
                    Assegna Servizio
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
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
            firmaDigitaleAttiva={firmaDigitaleAttiva}
          />
          
          {/* Mobile Action Buttons - Sticky at bottom - Sequential UX Flow */}
          {(canRequestSignature || (!canRequestSignature && canBeCompleted)) && (
            <div className="fixed bottom-16 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-4 z-40">
              
              {/* STEP 1: Richiedi Firma Cliente (se non ancora firmato) */}
              {canRequestSignature && (
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={() => setShowFirmaClienteDialog(true)}
                >
                  <Edit3 className="h-5 w-5" />
                  Firma Cliente
                </Button>
              )}

              {/* STEP 2: Completa Servizio (solo se già firmato o firma non obbligatoria) */}
              {!canRequestSignature && canBeCompleted && (
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={() => setCompletaDialogOpen(true)}
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Completa Servizio
                </Button>
              )}

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

        {/* Dialog Firma Cliente */}
        <FirmaCliente
          open={showFirmaClienteDialog}
          onOpenChange={setShowFirmaClienteDialog}
          servizioId={servizio.id}
          onSuccess={() => {
            setShowFirmaClienteDialog(false);
            refetch();
          }}
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
          
          {/* Button Assegna Servizio - Desktop */}
          {servizio.stato === 'da_assegnare' && isAdmin && (
            <div className="mt-4">
              <Button 
                onClick={() => setAssegnazioneSheetOpen(true)}
                variant="default"
              >
                <Users className="h-4 w-4 mr-2" />
                Assegna Servizio
              </Button>
            </div>
          )}
          
          {/* Button Richiedi Firma Cliente - Desktop */}
          {canRequestSignature && (
            <div className="mt-4">
              <Button 
                onClick={() => setShowFirmaClienteDialog(true)}
                variant="outline"
                className="gap-2"
              >
                <Edit3 className="h-4 w-4" />
                Richiedi Firma Cliente
              </Button>
            </div>
          )}
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

        {/* Dialog Firma Cliente */}
        <FirmaCliente
          open={showFirmaClienteDialog}
          onOpenChange={setShowFirmaClienteDialog}
          servizioId={servizio.id}
          onSuccess={() => {
            setShowFirmaClienteDialog(false);
            refetch();
          }}
        />

        {/* Assignment Popup - Desktop */}
        <AssignmentPopup
          open={assegnazioneSheetOpen}
          onOpenChange={setAssegnazioneSheetOpen}
          onClose={() => {
            setAssegnazioneSheetOpen(false);
            refetch();
          }}
          servizio={servizio}
        />
      </div>
    </MainLayout>
  );
}
