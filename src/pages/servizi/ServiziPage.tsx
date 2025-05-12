
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Loader2, Calendar, Table as TableIcon, Layout } from "lucide-react";
import { useServizi } from "@/hooks/useServizi";
import { useUsers } from "@/hooks/useUsers";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Servizio, StatoServizio } from "@/lib/types/servizi";
import { AssegnazioneDialog } from "@/components/servizi/AssegnazioneDialog";
import { EmptyState } from "@/components/servizi/EmptyState";
import { ServizioTabs } from "@/components/servizi/ServizioTabs";
import { ServizioTabContent } from "@/components/servizi/ServizioTabContent";
import { CalendarView } from "@/components/servizi/CalendarView";
import { groupServiziByStatus } from "@/components/servizi/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ServizioTable } from "@/components/servizi/ServizioTable";

export default function ServiziPage() {
  const navigate = useNavigate();
  const { servizi, isLoading, error } = useServizi();
  const { users } = useUsers();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("da_assegnare");
  const [selectedServizio, setSelectedServizio] = useState<Servizio | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  
  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';
  
  // Group services by status
  const serviziByStatus = groupServiziByStatus(servizi);
  
  const handleNavigateToDetail = (id: string) => {
    navigate(`/servizi/${id}`);
  };

  // Function to handle switching to calendar view
  const handleShowCalendarView = () => {
    setActiveTab("calendario");
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
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleShowCalendarView}>
              <Calendar className="mr-2 h-4 w-4" />
              Calendario
            </Button>
            <Button onClick={() => navigate("/nuovo-servizio")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuovo servizio
            </Button>
          </div>
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
            <div className="flex justify-between items-center mb-4">
              <ServizioTabs 
                servizi={servizi} 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
              />
              
              {activeTab !== "calendario" && (
                <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as "cards" | "table")}>
                  <ToggleGroupItem value="cards" aria-label="Visualizza schede">
                    <Layout className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="table" aria-label="Visualizza tabella">
                    <TableIcon className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              )}
            </div>
            
            {(["da_assegnare", "assegnato", "non_accettato", "completato", "annullato"] as const).map((status) => (
              <TabsContent key={status} value={status} className="mt-0">
                {viewMode === "cards" ? (
                  <ServizioTabContent
                    status={status}
                    servizi={serviziByStatus[status]}
                    users={users}
                    isAdminOrSocio={isAdminOrSocio}
                    onSelectServizio={setSelectedServizio}
                    onNavigateToDetail={handleNavigateToDetail}
                  />
                ) : (
                  <ServizioTable
                    servizi={serviziByStatus[status]}
                    users={users}
                    onNavigateToDetail={handleNavigateToDetail}
                    onSelect={isAdminOrSocio ? setSelectedServizio : undefined}
                    isAdminOrSocio={isAdminOrSocio}
                  />
                )}
              </TabsContent>
            ))}
            
            <TabsContent value="calendario" className="mt-0">
              <CalendarView 
                servizi={servizi}
                users={users}
                onNavigateToDetail={handleNavigateToDetail}
              />
            </TabsContent>
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
