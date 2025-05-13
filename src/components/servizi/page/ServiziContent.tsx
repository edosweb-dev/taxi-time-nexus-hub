
import { useState } from "react";
import { Loader2, Layout, Table as TableIcon } from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { ServizioTabs } from "@/components/servizi/ServizioTabs";
import { ServizioTabContent } from "@/components/servizi/ServizioTabContent";
import { ServizioTable } from "@/components/servizi/ServizioTable";
import { EmptyState } from "@/components/servizi/EmptyState";
import { groupServiziByStatus } from "@/components/servizi/utils";

interface ServiziContentProps {
  servizi: Servizio[];
  users: Profile[];
  isLoading: boolean;
  error: Error | null;
  isAdminOrSocio: boolean;
  isMobile: boolean;
  onNavigateToDetail: (id: string) => void;
  onNavigateToNewServizio: () => void;
  onSelectServizio: (servizio: Servizio) => void;
  onCompleta: (servizio: Servizio) => void;
  onFirma: (servizio: Servizio) => void;
  allServizi: Servizio[]; // Added this prop for global indexing
}

export function ServiziContent({
  servizi,
  users,
  isLoading,
  error,
  isAdminOrSocio,
  isMobile,
  onNavigateToDetail,
  onNavigateToNewServizio,
  onSelectServizio,
  onCompleta,
  onFirma,
  allServizi
}: ServiziContentProps) {
  const [activeTab, setActiveTab] = useState<string>("da_assegnare");
  const [viewMode, setViewMode] = useState<"cards" | "table">(isMobile ? "cards" : "table");
  
  // Group services by status
  const serviziByStatus = groupServiziByStatus(servizi);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            Si è verificato un errore nel caricamento dei servizi
          </div>
        </CardContent>
      </Card>
    );
  }

  if (servizi.length === 0) {
    return (
      <EmptyState 
        message="Non ci sono servizi disponibili" 
        showButton={true}
        onCreateNew={onNavigateToNewServizio}
      />
    );
  }

  return (
    <Tabs defaultValue="da_assegnare" value={activeTab} onValueChange={setActiveTab}>
      <div className="flex justify-between items-center mb-4">
        <ServizioTabs 
          servizi={servizi} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        
        {!isMobile && (
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
      
      {(["da_assegnare", "assegnato", "non_accettato", "completato", "annullato", "consuntivato"] as const).map((status) => (
        <TabsContent key={status} value={status} className="mt-0">
          {viewMode === "cards" ? (
            <ServizioTabContent
              status={status}
              servizi={serviziByStatus[status]}
              users={users}
              isAdminOrSocio={isAdminOrSocio}
              onSelectServizio={onSelectServizio}
              onNavigateToDetail={onNavigateToDetail}
              onCompleta={onCompleta}
              onFirma={onFirma}
              allServizi={allServizi}
            />
          ) : (
            <ServizioTable
              servizi={serviziByStatus[status]}
              users={users}
              onNavigateToDetail={onNavigateToDetail}
              onSelect={isAdminOrSocio ? onSelectServizio : undefined}
              onCompleta={onCompleta}
              onFirma={onFirma}
              isAdminOrSocio={isAdminOrSocio}
              allServizi={allServizi}
            />
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
