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
// Responsive UI components
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';

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
        
        // Cliente privato search (Bug #11)
        const clientePrivatoNome = servizio.cliente_privato_nome?.toLowerCase() || '';
        const clientePrivatoCognome = servizio.cliente_privato_cognome?.toLowerCase() || '';
        const clientePrivatoFull = `${clientePrivatoNome} ${clientePrivatoCognome}`.trim();

        // Passeggeri search (Bug #8)
        const passeggeriNomi = (servizio as any).passeggeri?.map(
          (p: any) => p.nome_cognome?.toLowerCase() || ''
        ).join(' ') || '';
        
        const matches = 
          servizio.numero_commessa?.toLowerCase().includes(searchLower) ||
          servizio.indirizzo_presa?.toLowerCase().includes(searchLower) ||
          servizio.indirizzo_destinazione?.toLowerCase().includes(searchLower) ||
          aziendaNome.includes(searchLower) ||
          clientePrivatoFull.includes(searchLower) ||
          passeggeriNomi.includes(searchLower);
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
  
  // Use passeggeri counts hook after filteredServizi is defined
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
    <ResponsiveContainer size="full" className="space-y-4 md:space-y-6">
      {/* Mobile-First Layout */}
      <div className="md:hidden space-y-4">
        {/* Mobile Stats */}
        <MobileServiziStats servizi={filteredServizi} isLoading={isLoading} />
        
        {/* Mobile Controls - Stack vertically for better viewport usage */}
        <div className="space-y-3">
          {/* Filters and Tabs Container - Full width with proper containment */}
          <div className="w-full overflow-hidden space-y-3">
            <MobileFiltersDrawer
              servizi={servizi}
              users={users}
              filters={filters}
              onFiltersChange={setFilters}
              onApplyFilters={() => {}}
              onClearFilters={() => setFilters({
                search: '',
                aziendaId: '',
                assigneeId: '',
                dateFrom: undefined,
                dateTo: undefined
              })}
            />
            
            <div className="w-full overflow-hidden">
              <MobileTabs
                tabs={[
                  { id: 'da_assegnare', label: 'Da Assegnare', count: statusCounts.da_assegnare },
                  { id: 'assegnato', label: 'Assegnati', count: statusCounts.assegnato },
                  { id: 'completato', label: 'Completati', count: statusCounts.completato },
                  { id: 'annullato', label: 'Annullati', count: statusCounts.annullato }
                ]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>
          </div>
          
          {/* Action Buttons - Mobile optimized grid */}
          <ResponsiveGrid 
            cols={{ mobile: 2, tablet: 2, desktop: 3 }} 
            gap="sm"
            className="w-full"
          >
            <Button
              variant="outline"
              size="sm"
              className="text-xs w-full"
              onClick={onNavigateToNewServizio}
            >
              <BarChart3 className="h-3 w-3 mr-1" />
              Report
            </Button>
            <Button
              variant="outline" 
              size="sm"
              className="text-xs w-full"
              onClick={onNavigateToNewServizio}
            >
              <Calendar className="h-3 w-3 mr-1" />
              Calendario
            </Button>
            {/* New Service Button - spans full width on mobile */}
            {isAdminOrSocio && (
              <Button
                size="sm"
                className="w-full col-span-2"
                onClick={onNavigateToNewServizio}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuovo Servizio
              </Button>
            )}
          </ResponsiveGrid>
        </div>
        
        {/* Mobile Content - Proper containment to prevent overflow */}
        <div className="w-full min-h-[50vh] overflow-hidden">
          {Object.keys(serviziByStatus).some(status => serviziByStatus[status as keyof typeof serviziByStatus].length > 0) ? (
            <ServizioCardList
              servizi={serviziByStatus[activeTab as keyof typeof serviziByStatus]}
              users={users}
              aziende={aziende || []}
              passeggeriCounts={passeggeriCounts}
              onNavigateToDetail={onNavigateToDetail}
              onSelect={onSelectServizio}
              onCompleta={onCompleta}
              onFirma={onFirma}
              isAdminOrSocio={isAdminOrSocio}
              allServizi={allServizi}
            />
          ) : (
            <EmptyState
              message="Nessun servizio trovato per i criteri selezionati."
              showButton={isAdminOrSocio}
              onCreateNew={onNavigateToNewServizio}
            />
          )}
        </div>
      </div>

      {/* Desktop Layout - Unchanged but improved */}
      <div className="hidden md:block space-y-6">
        {/* Desktop Stats */}
        <ServizioStats servizi={filteredServizi} isLoading={isLoading} />
        
        {/* Desktop Header with Actions */}
        <div className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <ServiziFilters
              servizi={servizi}
              users={users}
              filters={filters}
              onFiltersChange={setFilters}
              onApplyFilters={() => {}}
              onClearFilters={() => setFilters({
                search: '',
                aziendaId: '',
                assigneeId: '',
                dateFrom: undefined,
                dateTo: undefined
              })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateToNewServizio}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Report
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateToNewServizio}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendario
            </Button>
            {isAdminOrSocio && (
              <Button
                size="sm"
                onClick={onNavigateToNewServizio}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuovo Servizio
              </Button>
            )}
          </div>
        </div>

        {/* Desktop Tabbed Table View */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="da_assegnare" className="relative">
              Da Assegnare
              {statusCounts.da_assegnare > 0 && (
                <span className="ml-1 rounded-full bg-destructive px-1.5 py-0.5 text-xs text-destructive-foreground">
                  {statusCounts.da_assegnare}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="assegnato" className="relative">
              Assegnati
              {statusCounts.assegnato > 0 && (
                <span className="ml-1 rounded-full bg-yellow-500 px-1.5 py-0.5 text-xs text-white">
                  {statusCounts.assegnato}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="non_accettato">Non Accettati</TabsTrigger>
            <TabsTrigger value="completato" className="relative">
              Completati
              {statusCounts.completato > 0 && (
                <span className="ml-1 rounded-full bg-green-500 px-1.5 py-0.5 text-xs text-white">
                  {statusCounts.completato}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="annullato" className="relative">
              Annullati
              {statusCounts.annullato > 0 && (
                <span className="ml-1 rounded-full bg-gray-500 px-1.5 py-0.5 text-xs text-white">
                  {statusCounts.annullato}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="consuntivato">Consuntivati</TabsTrigger>
          </TabsList>

          {(["da_assegnare", "assegnato", "non_accettato", "completato", "annullato", "consuntivato"] as const).map((status) => (
            <TabsContent key={status} value={status} className="mt-0">
              <div className="rounded-md border h-[600px] flex flex-col">
                <ServizioTable
                  servizi={serviziByStatus[status]}
                  users={users}
                  onNavigateToDetail={onNavigateToDetail}
                  onSelect={onSelectServizio}
                  onCompleta={onCompleta}
                  onFirma={onFirma}
                  isAdminOrSocio={isAdminOrSocio}
                  allServizi={allServizi}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </ResponsiveContainer>
  );
}