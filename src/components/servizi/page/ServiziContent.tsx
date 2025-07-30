import { useState, useMemo } from 'react';
import { Loader2, Plus, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServizioStats } from '../ServizioStats';
import { ServiziFilters, type ServiziFiltersState } from '../filters/ServiziFilters';
import { ServizioTable } from '../ServizioTable';
import { EmptyState } from '../EmptyState';
import { groupServiziByStatus } from '../utils/groupingUtils';
import { Servizio } from '@/lib/types/servizi';
import { Profile } from '@/lib/types';
import { Azienda } from '@/lib/types';
import { useAziende } from '@/hooks/useAziende';
import { usePasseggeriCounts } from '../hooks/usePasseggeriCounts';
// Mobile components
import { MobileServiziStats } from '../mobile/MobileServiziStats';
import { MobileFiltersDrawer } from '../mobile/MobileFiltersDrawer';
import { MobileTabs } from '../mobile/MobileTabs';
import { ServizioCardList } from '../mobile/ServizioCardList';

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
  
  const { passeggeriCounts } = usePasseggeriCounts(filteredServizi);
  
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

  // Tab configuration for mobile
  const tabsConfig = [
    { id: 'da_assegnare', label: 'Da assegnare', count: statusCounts.da_assegnare },
    { id: 'assegnato', label: 'Assegnati', count: statusCounts.assegnato },
    { id: 'completato', label: 'Completati', count: statusCounts.completato },
    { id: 'non_accettato', label: 'Non accettati', count: statusCounts.non_accettato },
    { id: 'annullato', label: 'Annullati', count: statusCounts.annullato },
    { id: 'consuntivato', label: 'Consuntivati', count: statusCounts.consuntivato },
  ];

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
        {isMobile ? (
          <MobileServiziStats servizi={[]} isLoading={true} />
        ) : (
          <ServizioStats servizi={[]} isLoading={true} />
        )}
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
      {/* Statistics Cards - Responsive */}
      {isMobile ? (
        <MobileServiziStats servizi={filteredServizi} isLoading={isLoading} />
      ) : (
        <ServizioStats servizi={filteredServizi} isLoading={isLoading} />
      )}

      {/* Header with Actions - Mobile Optimized */}
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'} ${isMobile ? 'gap-3' : 'sm:items-center sm:justify-between gap-4'}`}>
        <div>
          <h2 className={`font-semibold text-foreground text-enhanced ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            Gestione Servizi
          </h2>
          <p className="text-sm text-muted-foreground">
            {filteredServizi.length} servizi totali
            {filteredServizi.length !== servizi.length && ` (${servizi.length} senza filtri)`}
          </p>
        </div>
        
        {/* Action Buttons - Mobile Responsive */}
        <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'}`}>
          {isMobile ? (
            <MobileFiltersDrawer
              servizi={servizi}
              users={users}
              filters={filters}
              onFiltersChange={setFilters}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
            />
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/report-servizi'}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Report
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/calendario-servizi'}>
                <Calendar className="h-4 w-4 mr-2" />
                Vista Calendario
              </Button>
            </>
          )}
          <Button onClick={onNavigateToNewServizio} size="sm" className={isMobile ? 'flex-1' : ''}>
            <Plus className="h-4 w-4 mr-2" />
            {isMobile ? 'Nuovo' : 'Nuovo Servizio'}
          </Button>
        </div>
      </div>

      {/* Filters - Desktop Only */}
      {!isMobile && (
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
      )}

      {/* Tabs and Content - Responsive */}
      {isMobile ? (
        <div className="space-y-4">
          <MobileTabs
            tabs={tabsConfig}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          
          <div className="min-h-[400px]">
            <ServizioCardList
              servizi={serviziByStatus[activeTab as keyof typeof serviziByStatus]}
              users={users}
              aziende={aziende}
              passeggeriCounts={passeggeriCounts}
              allServizi={allServizi}
              isAdminOrSocio={isAdminOrSocio}
              onNavigateToDetail={onNavigateToDetail}
              onSelect={isAdminOrSocio ? onSelectServizio : undefined}
              onCompleta={onCompleta}
              onFirma={onFirma}
            />
          </div>
        </div>
      ) : (
        <Tabs defaultValue="da_assegnare" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-6">
            <TabsList className="grid w-full grid-cols-6 h-10">
              <TabsTrigger value="da_assegnare" className="text-sm">
                Da assegnare ({statusCounts.da_assegnare})
              </TabsTrigger>
              <TabsTrigger value="assegnato" className="text-sm">
                Assegnati ({statusCounts.assegnato})
              </TabsTrigger>
              <TabsTrigger value="completato" className="text-sm">
                Completati ({statusCounts.completato})
              </TabsTrigger>
              <TabsTrigger value="non_accettato" className="text-sm">
                Non accettati ({statusCounts.non_accettato})
              </TabsTrigger>
              <TabsTrigger value="annullato" className="text-sm">
                Annullati ({statusCounts.annullato})
              </TabsTrigger>
              <TabsTrigger value="consuntivato" className="text-sm">
                Consuntivati ({statusCounts.consuntivato})
              </TabsTrigger>
            </TabsList>
          </div>
          
          {(["da_assegnare", "assegnato", "non_accettato", "completato", "annullato", "consuntivato"] as const).map((status) => (
            <TabsContent key={status} value={status} className="mt-0">
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
      )}
    </div>
  );
}