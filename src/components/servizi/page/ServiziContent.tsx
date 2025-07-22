import { useState, useMemo } from "react";
import { Loader2, Layout, Table as TableIcon, Plus, Calendar } from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { ServizioTabs } from "@/components/servizi/ServizioTabs";
import { ServizioTabContent } from "@/components/servizi/ServizioTabContent";
import { ServizioTable } from "@/components/servizi/ServizioTable";
import { EmptyState } from "@/components/servizi/EmptyState";
import { ServizioStats } from "@/components/servizi/ServizioStats";
import { ServiziFilters, ServiziFiltersState } from "@/components/servizi/filters/ServiziFilters";
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
  const [filters, setFilters] = useState<ServiziFiltersState>({
    search: '',
    aziendaId: '',
    assigneeId: '',
    dateFrom: undefined,
    dateTo: undefined
  });

  // Filter servizi based on current filters
  const filteredServizi = useMemo(() => {
    return servizi.filter(servizio => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matches = 
          servizio.numero_commessa?.toLowerCase().includes(searchLower) ||
          servizio.indirizzo_presa.toLowerCase().includes(searchLower) ||
          servizio.indirizzo_destinazione.toLowerCase().includes(searchLower);
        if (!matches) return false;
      }

      // Azienda filter
      if (filters.aziendaId && servizio.azienda_id !== filters.aziendaId) {
        return false;
      }

      // Assignee filter
      if (filters.assigneeId && servizio.assegnato_a !== filters.assigneeId) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom) {
        const serviceDate = new Date(servizio.data_servizio);
        const fromDate = new Date(filters.dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (serviceDate < fromDate) return false;
      }

      if (filters.dateTo) {
        const serviceDate = new Date(servizio.data_servizio);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (serviceDate > toDate) return false;
      }

      return true;
    });
  }, [servizi, filters]);
  
  // Group filtered services by status
  const serviziByStatus = groupServiziByStatus(filteredServizi);

  const handleApplyFilters = () => {
    // Filters are applied automatically via useMemo
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      aziendaId: '',
      assigneeId: '',
      dateFrom: undefined,
      dateTo: undefined
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <ServizioStats servizi={[]} isLoading={true} />
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
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
    <div className="space-y-6">
      {/* Statistics Cards */}
      <ServizioStats servizi={filteredServizi} isLoading={isLoading} />

      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Gestione Servizi</h2>
          <p className="text-sm text-muted-foreground">
            {filteredServizi.length} servizi totali
            {filteredServizi.length !== servizi.length && ` (${servizi.length} senza filtri)`}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Vista Calendario
          </Button>
          <Button onClick={onNavigateToNewServizio} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Servizio
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border pb-4">
        <ServiziFilters
          servizi={servizi}
          users={users}
          filters={filters}
          onFiltersChange={setFilters}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />
      </div>

      <Tabs defaultValue="da_assegnare" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <ServizioTabs 
            servizi={filteredServizi} 
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
          <TabsContent key={status} value={status} className="mt-6 min-h-[600px]">
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
              <div className="min-h-[500px] max-h-[600px] overflow-y-auto">
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
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}