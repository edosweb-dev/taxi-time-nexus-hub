
import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { DipendenteLayout } from "@/components/layouts/DipendenteLayout";
import { useServizioDetail } from "@/hooks/useServizioDetail";
import { useUsers } from "@/hooks/useUsers";
import { useServizi } from "@/hooks/useServizi";
import { useServizioStateMachine } from "@/hooks/useServizioStateMachine";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ServizioHeader } from "@/components/servizi/dettaglio/ServizioHeader";
import { ServizioLoading, ServizioError } from "@/components/servizi/dettaglio/ServizioLoadingError";
import { ServizioTabs } from "@/components/servizi/dettaglio/ServizioTabs";
import { ServizioDialogs } from "@/components/servizi/dettaglio/ServizioDialogs";
import { ServizioDetailDesktop } from "@/components/servizi/dettaglio/ServizioDetailDesktop";
import { RoadmapPasseggeri } from "@/components/servizi/detail/RoadmapPasseggeri";
import { useVeicoli } from "@/hooks/useVeicoli";
import { MobileServizioOptimized } from "@/components/servizio/mobile/MobileServizioOptimized";
import { AssignmentPopup } from "@/components/servizi/assegnazione/AssignmentPopup";
import { FirmaCliente } from "@/components/servizi/FirmaCliente";
import { useAuth } from "@/contexts/AuthContext";
import { DeleteServizioDialog } from "@/components/servizi/dialogs";

export default function ServizioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isFromReport = location.state?.from === 'report-passeggeri';
  const reportFilters = location.state?.filters;
  const { users } = useUsers();
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  const { veicoli = [] } = useVeicoli();

  // 🔹 UNIFIED HOOK - gestisce sia admin che dipendente
  const isDipendente = profile?.role === 'dipendente';
  
  // 🔹 CONDITIONAL LAYOUT BASED ON ROLE
  const Layout = isDipendente ? DipendenteLayout : MainLayout;

  // 🔹 Hook unificato per tutti i ruoli
  const hookResult = useServizioDetail(id);
  
  const {
    servizio,
    passeggeri,
    isLoading,
    error,
    refetch,
    users: detailUsers,
    getAziendaName,
    getAzienda,
    formatCurrency,
    firmaDigitaleAttiva,
    servizioIndex,
    allServizi,
    canBeEdited,
    canBeCompleted,
    canBeConsuntivato,
    veicoloModello: veicoloModelloFromHook,
    allPasseggeriSigned,
    firmePasseggeri,
  } = hookResult;

  // 🔒 SECURITY: Dipendente può vedere solo servizi assegnati a lui
  if (isDipendente && servizio && servizio.assegnato_a !== profile?.id) {
    navigate('/dipendente/servizi-assegnati');
    return null;
  }

  // 🔹 DIALOG STATE (shared)
  const [completaDialogOpen, setCompletaDialogOpen] = useState(false);
  const [consuntivaDialogOpen, setConsuntivaDialogOpen] = useState(false);

  const [assegnazioneSheetOpen, setAssegnazioneSheetOpen] = useState(false);
  const [showFirmaClienteDialog, setShowFirmaClienteDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rimuoviAssegnazioneDialogOpen, setRimuoviAssegnazioneDialogOpen] = useState(false);
  
  const isAdmin = profile?.role === 'admin' || profile?.role === 'socio';
  const { deleteServizio, isDeleting } = useServizi();
  const { unassignServizio, isUnassigning } = useServizioStateMachine();
  
  const canRequestSignature = 
    servizio?.stato === 'assegnato' && 
    firmaDigitaleAttiva && 
    !servizio?.firma_url &&
    (profile?.role === 'admin' || 
     profile?.role === 'socio' || 
     servizio?.assegnato_a === profile?.id);
  
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

  // Check if there are any actions available for mobile menu
  const hasMobileActions = canBeEdited || canBeConsuntivato || (servizio.stato === 'da_assegnare' && isAdmin);

  // Get vehicle model - priorità all'hook, fallback alla ricerca
  const veicoloModello = veicoloModelloFromHook || veicoli.find(v => v.id === servizio?.veicolo_id)?.modello;

  // Mobile-first layout
  if (isMobile) {
    return (
      <Layout 
        title="Dettaglio Servizio"
      >
        <div className="mobile-servizio-detail px-4 pb-32 sm:pb-8">
          <MobileServizioOptimized
            servizio={servizio}
            passeggeri={passeggeri}
            formatCurrency={formatCurrency}
            getAziendaName={getAziendaName}
            getUserName={getUserName}
            users={users}
            veicoloModello={veicoloModello}
            firmaDigitaleAttiva={firmaDigitaleAttiva}
            canBeEdited={canBeEdited}
            canBeCompleted={canBeCompleted}
            canBeConsuntivato={canBeConsuntivato}
            canRequestSignature={canRequestSignature}
            isAdmin={isAdmin}
            servizioIndex={servizioIndex}
            allPasseggeriSigned={allPasseggeriSigned}
            firmePasseggeri={firmePasseggeri}
            onAssegna={() => setAssegnazioneSheetOpen(true)}
            onCompleta={() => setCompletaDialogOpen(true)}
            onConsuntiva={() => setConsuntivaDialogOpen(true)}
            onModifica={() => navigate(`/servizi/${servizio.id}/modifica`)}
            onElimina={() => {
              if (isAdmin) {
                setDeleteDialogOpen(true);
              }
            }}
            onFirmaCliente={() => setShowFirmaClienteDialog(true)}
            onRimuoviAssegnazione={() => setRimuoviAssegnazioneDialogOpen(true)}
            isRimuoviAssegnazioneLoading={isUnassigning}
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

        {/* FIX: DeleteServizioDialog per mobile */}
        <DeleteServizioDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          servizioId={servizio?.id}
          isDeleting={isDeleting}
          onConfirm={async () => {
            if (servizio?.id) {
              try {
                await deleteServizio(servizio.id);
                navigate('/servizi');
              } catch (error) {
                console.error('Errore eliminazione:', error);
                setDeleteDialogOpen(false);
              }
            }
          }}
        />

        {/* Dialog Conferma Rimozione Assegnazione */}
        <AlertDialog open={rimuoviAssegnazioneDialogOpen} onOpenChange={setRimuoviAssegnazioneDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Rimuovi Assegnazione</AlertDialogTitle>
              <AlertDialogDescription>
                Sei sicuro di voler rimuovere l'assegnazione di questo servizio?
                Il servizio tornerà disponibile nella lista "Da Assegnare".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isUnassigning}>Annulla</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (servizio?.id) {
                    unassignServizio(servizio.id, {
                      onSuccess: () => {
                        setRimuoviAssegnazioneDialogOpen(false);
                        refetch();
                      }
                    });
                  }
                }}
                className="bg-orange-600 hover:bg-orange-700"
                disabled={isUnassigning}
              >
                {isUnassigning ? "Rimuovendo..." : "Conferma Rimozione"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Layout>
    );
  }

  // Get veicolo model for desktop sidebar
  const veicolo = veicoli.find(v => v.id === servizio.veicolo_id);
  const veicoloModelloDesktop = veicolo ? veicolo.modello : undefined;

  // Desktop layout - NEW Sidebar + Main
  return (
    <Layout>
      {/* Desktop (≥1024px) - NEW Layout */}
      <div className="hidden lg:block">
          <ServizioDetailDesktop
            servizio={servizio}
            passeggeri={passeggeri}
            users={users}
            canBeEdited={canBeEdited}
            canBeCompleted={canBeCompleted}
            canBeConsuntivato={canBeConsuntivato}
            isAdmin={isAdmin}
            getAziendaName={getAziendaName}
            getUserName={getUserName}
            formatCurrency={formatCurrency}
            firmaDigitaleAttiva={firmaDigitaleAttiva}
            veicoloModello={veicoloModelloDesktop}
            onEdit={() => navigate(`/servizi/${servizio.id}/modifica`)}
            onAssegna={() => setAssegnazioneSheetOpen(true)}
            onDelete={() => {
              if (isAdmin) {
                setDeleteDialogOpen(true);
              }
            }}
            onCompleta={() => setCompletaDialogOpen(true)}
            onConsuntiva={() => setConsuntivaDialogOpen(true)}
            onBack={() => {
              if (isFromReport && reportFilters) {
                navigate('/report-passeggeri', { state: { filters: reportFilters } });
              } else {
                navigate(isDipendente ? '/dipendente/servizi-assegnati' : '/servizi');
              }
            }}
            backLabel={isFromReport ? 'Torna al Report Passeggeri' : undefined}
            onRimuoviAssegnazione={() => setRimuoviAssegnazioneDialogOpen(true)}
            isRimuoviAssegnazioneLoading={isUnassigning}
          />
        </div>

      {/* Tablet/Small Desktop (768px-1023px) - EXISTING Layout */}
      <div className="hidden md:block lg:hidden">
        <div className="space-y-4 md:space-y-6 px-2 md:px-0">
          {/* Header Section */}
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
            
            {/* Button Assegna Servizio */}
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
            
            {/* Button Richiedi Firma Cliente */}
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

          {/* Main Content */}
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
              allPasseggeriSigned={allPasseggeriSigned}
              firmePasseggeri={firmePasseggeri}
            />
          </div>
        </div>
      </div>

      {/* Dialogs (always present) */}
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

      {/* Assignment Popup */}
      <AssignmentPopup
        open={assegnazioneSheetOpen}
        onOpenChange={setAssegnazioneSheetOpen}
        onClose={() => {
          setAssegnazioneSheetOpen(false);
          refetch();
        }}
        servizio={servizio}
      />

      {/* Dialog conferma eliminazione */}
      <DeleteServizioDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        servizioId={servizio?.id}
        isDeleting={isDeleting}
        onConfirm={async () => {
          if (servizio?.id) {
            try {
              await deleteServizio(servizio.id);
              navigate('/servizi');
            } catch (error) {
              setDeleteDialogOpen(false);
            }
          }
        }}
      />

      {/* Dialog Conferma Rimozione Assegnazione - Desktop */}
      <AlertDialog open={rimuoviAssegnazioneDialogOpen} onOpenChange={setRimuoviAssegnazioneDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rimuovi Assegnazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler rimuovere l'assegnazione di questo servizio?
              Il servizio tornerà disponibile nella lista "Da Assegnare".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUnassigning}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (servizio?.id) {
                  unassignServizio(servizio.id, {
                    onSuccess: () => {
                      setRimuoviAssegnazioneDialogOpen(false);
                      refetch();
                    }
                  });
                }
              }}
              className="bg-orange-600 hover:bg-orange-700"
              disabled={isUnassigning}
            >
              {isUnassigning ? "Rimuovendo..." : "Conferma Rimozione"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
