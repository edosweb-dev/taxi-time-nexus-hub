
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Loader2 } from "lucide-react";
import { useServizi } from "@/hooks/useServizi";
import { useUsers } from "@/hooks/useUsers";
import { Tabs } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Servizio, StatoServizio } from "@/lib/types/servizi";
import { AssegnazioneDialog } from "@/components/servizi/AssegnazioneDialog";
import { EmptyState } from "@/components/servizi/EmptyState";
import { ServizioTabs } from "@/components/servizi/ServizioTabs";
import { ServizioTabContent } from "@/components/servizi/ServizioTabContent";
import { groupServiziByStatus } from "@/components/servizi/utils/serviceUtils";

export default function ServiziPage() {
  const navigate = useNavigate();
  const { servizi, isLoading, error } = useServizi();
  const { users } = useUsers();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("da_assegnare");
  const [selectedServizio, setSelectedServizio] = useState<Servizio | null>(null);
  
  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';
  
  // Group services by status
  const serviziByStatus = groupServiziByStatus(servizi);
  
  const handleNavigateToDetail = (id: string) => {
    navigate(`/servizi/${id}`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Servizi</h1>
            <p className="text-muted-foreground">
              Gestisci i servizi di trasporto
            </p>
          </div>
          <Button onClick={() => navigate("/nuovo-servizio")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuovo servizio
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-destructive">
                Si è verificato un errore nel caricamento dei servizi
              </div>
            </CardContent>
          </Card>
        ) : servizi.length === 0 ? (
          <EmptyState 
            message="Non ci sono servizi disponibili" 
            showButton={true}
            onCreateNew={() => navigate("/nuovo-servizio")}
          />
        ) : (
          <Tabs defaultValue="da_assegnare" value={activeTab} onValueChange={setActiveTab}>
            <ServizioTabs 
              servizi={servizi} 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
            />
            
            {(["da_assegnare", "assegnato", "non_accettato", "completato", "annullato"] as const).map((status) => (
              <ServizioTabContent
                key={status}
                status={status}
                servizi={serviziByStatus[status]}
                users={users}
                isAdminOrSocio={isAdminOrSocio}
                onSelectServizio={setSelectedServizio}
                onNavigateToDetail={handleNavigateToDetail}
              />
            ))}
          </Tabs>
        )}
      </div>
      
      {selectedServizio && (
        <AssegnazioneDialog 
          isOpen={!!selectedServizio} 
          onClose={() => setSelectedServizio(null)} 
          servizio={selectedServizio} 
        />
      )}
    </MainLayout>
  );
}
