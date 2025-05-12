
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useServizio } from "@/hooks/useServizi";
import { useAziende } from "@/hooks/useAziende";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/contexts/AuthContext";
import { FirmaDialog } from "@/components/servizi/firma/FirmaDialog";
import { saveSignature } from "@/lib/api/servizi";
import { toast } from "@/components/ui/sonner";
import { InfoTab } from "@/components/servizi/detail/InfoTab";
import { PasseggeriTab } from "@/components/servizi/detail/PasseggeriTab";
import { ServizioHeader } from "@/components/servizi/detail/ServizioHeader";
import { LoadingState } from "@/components/servizi/detail/LoadingState";
import { ErrorState } from "@/components/servizi/detail/ErrorState";

export default function ServizioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data, isLoading, error, refetch } = useServizio(id);
  const { aziende } = useAziende();
  const { users } = useUsers();
  const [activeTab, setActiveTab] = useState<string>("info");
  const [firmaDialogOpen, setFirmaDialogOpen] = useState(false);
  
  const servizio = data?.servizio;
  const passeggeri = data?.passeggeri || [];
  
  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';
  
  // Check if firma_digitale is enabled for this azienda
  const aziendaWithFirma = servizio?.azienda_id ? aziende.find(a => a.id === servizio.azienda_id) : null;
  const firmaDigitaleAttiva = aziendaWithFirma?.firma_digitale_attiva || false;
  const showFirmaButton = firmaDigitaleAttiva && !servizio?.firma_url;
  
  // Get company name by ID
  const getAziendaName = (aziendaId?: string) => {
    if (!aziendaId) return "Azienda sconosciuta";
    const azienda = aziende.find(a => a.id === aziendaId);
    return azienda ? azienda.nome : "Azienda sconosciuta";
  };
  
  const handleSignatureConfirm = async (signatureImage: string) => {
    if (!id) return;
    
    try {
      await saveSignature(id, signatureImage);
      toast.success("Firma salvata con successo");
      refetch(); // Reload servizio data to get the updated firma_url
    } catch (error) {
      console.error("Error saving signature:", error);
      toast.error("Errore nel salvataggio della firma");
    }
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState />
      </MainLayout>
    );
  }
  
  if (error || !servizio) {
    return (
      <MainLayout>
        <ErrorState onBack={() => navigate("/servizi")} />
      </MainLayout>
    );
  }
  
  // Add passeggeri count to servizio for InfoTab
  const servizioWithPasseggeriCount = {
    ...servizio,
    passeggeriCount: passeggeri.length
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <ServizioHeader 
          servizio={servizio}
          onBack={() => navigate("/servizi")}
          onEdit={() => navigate(`/servizi/${id}/edit`)}
          onOpenFirma={() => setFirmaDialogOpen(true)}
          showFirmaButton={showFirmaButton}
          isAdminOrSocio={isAdminOrSocio}
        />
        
        <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="info">Informazioni</TabsTrigger>
            <TabsTrigger value="passeggeri">
              Passeggeri ({passeggeri.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-6">
            <InfoTab 
              servizio={servizioWithPasseggeriCount}
              getAziendaName={getAziendaName}
              users={users}
            />
          </TabsContent>
          
          <TabsContent value="passeggeri" className="space-y-4">
            <PasseggeriTab 
              passeggeri={passeggeri}
              servizioPresa={servizio.indirizzo_presa}
              servizioDestinazione={servizio.indirizzo_destinazione}
              servizioOrario={servizio.orario_servizio}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <FirmaDialog 
        isOpen={firmaDialogOpen}
        onClose={() => setFirmaDialogOpen(false)}
        onConfirm={handleSignatureConfirm}
        servizioId={id || ''}
      />
    </MainLayout>
  );
}
