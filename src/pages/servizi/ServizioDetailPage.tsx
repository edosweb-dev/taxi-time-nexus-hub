
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useServizio } from "@/hooks/useServizio";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAziendaDetail } from "@/hooks/useAziendaDetail";
import { useUsers } from "@/hooks/useUsers";
import { ServiceHeader } from "@/components/servizi/detail/ServiceHeader";
import { ServiceInfoCard } from "@/components/servizi/detail/ServiceInfoCard";
import { PassengerList } from "@/components/servizi/detail/PassengerList";

export default function ServizioDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useServizio(id);
  const { users } = useUsers();
  
  const servizio = data?.servizio;
  const passeggeri = data?.passeggeri || [];
  
  // Fetch related azienda details - fixed the parameter type issue
  const { azienda } = useAziendaDetail(servizio?.azienda_id || "", Boolean(servizio?.azienda_id));
  
  // Find referent and assigned user details
  const referente = users.find(user => user.id === servizio?.referente_id);
  const assegnatario = users.find(user => user.id === servizio?.assegnato_a);
  
  const handleNavigateBack = () => {
    navigate("/servizi");
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (error || !servizio) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleNavigateBack}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Torna ai servizi
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-destructive">
                Si è verificato un errore nel caricamento del servizio o il servizio non esiste
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <ServiceHeader 
          servizio={servizio} 
          onNavigateBack={handleNavigateBack} 
        />
        
        <ServiceInfoCard 
          servizio={servizio} 
          referente={referente}
          assegnatario={assegnatario}
          azienda={azienda}
        />
        
        <PassengerList 
          passeggeri={passeggeri}
          defaultIndirizzoPresa={servizio.indirizzo_presa}
          defaultIndirizzoDestinazione={servizio.indirizzo_destinazione}
          defaultOrarioServizio={servizio.orario_servizio}
        />
      </div>
    </MainLayout>
  );
}
