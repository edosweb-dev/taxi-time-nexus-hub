import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { EmptyState } from './EmptyState';
import { Servizio } from '@/lib/types/servizi';
import { Profile } from '@/lib/types';
import { useAziende } from '@/hooks/useAziende';
import { usePasseggeriCounts } from './hooks/usePasseggeriCounts';
import { ServiziFiltersState } from './filters/ServiziFilters';
import { groupServiziByStatus } from './utils/groupingUtils';

// Mobile components
import { MobileServiziHeader } from './mobile/MobileServiziHeader';
import { MobileServiziSearch } from './mobile/MobileServiziSearch';
import { MobileFirstStats } from './mobile-first/MobileFirstStats';
import { MobileFirstTabs } from './mobile-first/MobileFirstTabs';
import { MobileFirstServiceList } from './mobile-first/MobileFirstServiceList';

// Desktop components
import { DesktopServiziContent } from './desktop/DesktopServiziContent';

interface ResponsiveServiziContentProps {
  servizi: Servizio[];
  users: Profile[];
  isLoading: boolean;
  error: Error | null;
  isAdminOrSocio: boolean;
  onNavigateToDetail: (id: string) => void;
  onNavigateToNewServizio: () => void;
  onSelectServizio: (servizio: Servizio) => void;
  onCompleta: (servizio: Servizio) => void;
  onFirma: (servizio: Servizio) => void;
  allServizi: Servizio[];
}

export function ResponsiveServiziContent({
  servizi,
  users,
  isLoading,
  error,
  isAdminOrSocio,
  onNavigateToDetail,
  onNavigateToNewServizio,
  onSelectServizio,
  onCompleta,
  onFirma,
  allServizi
}: ResponsiveServiziContentProps) {
  const { aziende } = useAziende();
  const isMobile = useIsMobile();
  
  const [activeTab, setActiveTab] = useState<string>('da_assegnare');
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ServiziFiltersState>({
    search: '',
    aziendaId: '',
    assigneeId: '',
    dateFrom: undefined,
    dateTo: undefined
  });

  // Filter servizi based on search and filters
  const filteredServizi = useMemo(() => {
    return servizi.filter(servizio => {
      // Combined search (from searchText or filters.search)
      const searchTerm = searchText || filters.search;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
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

      // Additional filters
      if (filters.aziendaId && servizio.azienda_id !== filters.aziendaId) {
        return false;
      }

      if (filters.assigneeId && servizio.assegnato_a !== filters.assigneeId) {
        return false;
      }

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
  }, [servizi, searchText, filters, aziende]);
  
  const { passeggeriCounts } = usePasseggeriCounts(filteredServizi);
  const serviziByStatus = groupServiziByStatus(filteredServizi);

  // Count servizi by status for tab badges
  const statusCounts = {
    bozza: serviziByStatus.bozza.length,
    da_assegnare: serviziByStatus.da_assegnare.length,
    assegnato: serviziByStatus.assegnato.length,
    completato: serviziByStatus.completato.length,
    annullato: serviziByStatus.annullato.length,
    non_accettato: serviziByStatus.non_accettato.length,
    consuntivato: serviziByStatus.consuntivato.length,
  };

  const handleClearFilters = () => {
    setSearchText('');
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
      <div className="w-full h-full">
        {isMobile ? (
          <div className="w-full min-h-screen bg-background">
            <MobileServiziHeader 
              isAdminOrSocio={isAdminOrSocio}
              onNavigateToNewServizio={onNavigateToNewServizio}
            />
            <div className="space-y-4">
              <MobileFirstStats servizi={[]} isLoading={true} />
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              Si è verificato un errore nel caricamento dei servizi
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (servizi.length === 0) {
    return (
      <div className="w-full h-full">
        <EmptyState 
          message="Non ci sono servizi disponibili" 
          showButton={true}
          onCreateNew={onNavigateToNewServizio}
        />
      </div>
    );
  }

  // Mobile Layout with natural responsive flow
  if (isMobile) {
    return (
      <div className="w-full min-h-screen overflow-x-hidden bg-background">
        {/* Mobile Header with Stats */}
        <div className="w-full">
          <MobileServiziHeader 
            isAdminOrSocio={isAdminOrSocio}
            onNavigateToNewServizio={onNavigateToNewServizio}
          />
        </div>
        
        <div className="w-full space-y-4">
          <MobileFirstStats servizi={filteredServizi} isLoading={isLoading} />
        </div>

        {/* Search and Filters */}
        <div className="w-full">
          <MobileServiziSearch
            searchText={searchText}
            onSearchChange={setSearchText}
            showFilters={showFilters}
            onShowFiltersChange={setShowFilters}
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={handleClearFilters}
            servizi={servizi}
            users={users}
          />
        </div>

        {/* Status Tabs */}
        <div className="w-full bg-card border-b">
          <MobileFirstTabs
            tabs={[
              { id: 'bozza', label: 'Bozze', count: statusCounts.bozza },
              { id: 'da_assegnare', label: 'Da Assegnare', count: statusCounts.da_assegnare },
              { id: 'assegnato', label: 'Assegnati', count: statusCounts.assegnato },
              { id: 'completato', label: 'Completati', count: statusCounts.completato },
              { id: 'non_accettato', label: 'Non Accettati', count: statusCounts.non_accettato },
              { id: 'annullato', label: 'Annullati', count: statusCounts.annullato },
              { id: 'consuntivato', label: 'Consuntivati', count: statusCounts.consuntivato },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Service List */}
        <div className="w-full pb-20 px-0">
          {serviziByStatus[activeTab as keyof typeof serviziByStatus].length > 0 ? (
            <MobileFirstServiceList
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
    );
  }

  // Desktop Layout
  return (
    <div className="w-full">
      <DesktopServiziContent
        servizi={filteredServizi}
        users={users}
        isLoading={isLoading}
        isAdminOrSocio={isAdminOrSocio}
        onNavigateToDetail={onNavigateToDetail}
        onNavigateToNewServizio={onNavigateToNewServizio}
        onSelectServizio={onSelectServizio}
        onCompleta={onCompleta}
        onFirma={onFirma}
        allServizi={allServizi}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={handleClearFilters}
      />
    </div>
  );
}