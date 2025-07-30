import { useState, useMemo } from 'react';
import { Loader2, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServizioStats } from '../ServizioStats';
import { ServiziFilters, type ServiziFiltersState } from '../filters/ServiziFilters';
import { ServizioTable } from '../ServizioTable';
import { EmptyState } from '../EmptyState';
import { groupServiziByStatus } from '../utils/groupingUtils';
import { ServiziCalendarView } from '../calendar/ServiziCalendarView';
import { Servizio } from '@/lib/types/servizi';
import { Profile } from '@/lib/types';
import { Azienda } from '@/lib/types';
import { useAziende } from '@/hooks/useAziende';

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
  allServizi: Servizio[];
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
  const { aziende } = useAziende();
  const [activeTab, setActiveTab] = useState<string>('da_assegnare');
  const [showCalendar, setShowCalendar] = useState(false);
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
        
        // Find azienda name by ID
        const azienda = aziende.find(a => a.id === servizio.azienda_id);
        const aziendaNome = azienda?.nome?.toLowerCase() || '';
        
        const matches = 
          servizio.numero_commessa?.toLowerCase().includes(searchLower) ||
          servizio.indirizzo_presa.toLowerCase().includes(searchLower) ||
          servizio.indirizzo_destinazione.toLowerCase().includes(searchLower) ||
          aziendaNome.includes(searchLower);
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
  }, [servizi, filters, aziende]);
  
  // Group filtered services by status
  const serviziByStatus = groupServiziByStatus(filteredServizi);

  // Count servizi by status for tab badges
  const statusCounts = {
    da_assegnare: serviziByStatus.da_assegnare.length,
    assegnato: serviziByStatus.assegnato.length,
    completato: serviziByStatus.completato.length,
    annullato: serviziByStatus.annullato.length,
    non_accettato: serviziByStatus.non_accettato.length,
    consuntivato: serviziByStatus.consuntivato.length,
  };

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
          <h2 className="text-2xl font-semibold text-foreground text-enhanced">Gestione Servizi</h2>
          <p className="text-sm text-muted-foreground">
            {filteredServizi.length} servizi totali
            {filteredServizi.length !== servizi.length && ` (${servizi.length} senza filtri)`}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowCalendar(true)}>
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

      <Tabs defaultValue="da_assegnare" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="mb-6">
          <TabsList className="grid w-full grid-cols-6 h-10">
            <TabsTrigger 
              value="da_assegnare" 
              className="text-sm"
            >
              Da assegnare ({statusCounts.da_assegnare})
            </TabsTrigger>
            <TabsTrigger 
              value="assegnato" 
              className="text-sm"
            >
              Assegnati ({statusCounts.assegnato})
            </TabsTrigger>
            <TabsTrigger 
              value="completato" 
              className="text-sm"
            >
              Completati ({statusCounts.completato})
            </TabsTrigger>
            <TabsTrigger 
              value="non_accettato" 
              className="text-sm"
            >
              Non accettati ({statusCounts.non_accettato})
            </TabsTrigger>
            <TabsTrigger 
              value="annullato" 
              className="text-sm"
            >
              Annullati ({statusCounts.annullato})
            </TabsTrigger>
            <TabsTrigger 
              value="consuntivato" 
              className="text-sm"
            >
              Consuntivati ({statusCounts.consuntivato})
            </TabsTrigger>
          </TabsList>
        </div>
        
        {(["da_assegnare", "assegnato", "non_accettato", "completato", "annullato", "consuntivato"] as const).map((status) => (
          <TabsContent 
            key={status} 
            value={status} 
            className="mt-0"
          >
            <div className="rounded-md border h-[600px] flex flex-col">
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
          </TabsContent>
        ))}
      </Tabs>

      {/* Calendar View Dialog */}
      <ServiziCalendarView
        servizi={allServizi}
        users={users}
        aziende={aziende}
        open={showCalendar}
        onOpenChange={setShowCalendar}
        onNavigateToDetail={onNavigateToDetail}
      />
    </div>
  );
}