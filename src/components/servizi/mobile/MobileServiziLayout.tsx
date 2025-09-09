import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '../EmptyState';
import { Servizio } from '@/lib/types/servizi';
import { Profile } from '@/lib/types';
import { useAziende } from '@/hooks/useAziende';
import { usePasseggeriCounts } from '../hooks/usePasseggeriCounts';
import { ServiziFiltersState } from '../filters/ServiziFilters';
import { groupServiziByStatus } from '../utils/groupingUtils';
import { MobileServiziHeader } from './MobileServiziHeader';
import { MobileServiziSearch } from './MobileServiziSearch';
import { MobileServiziTabs } from './MobileServiziTabs';
import { MobileServiziList } from './MobileServiziList';
import { MobileFirstStats } from '../mobile-first/MobileFirstStats';

interface MobileServiziLayoutProps {
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

export function MobileServiziLayout({
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
}: MobileServiziLayoutProps) {
  const { aziende } = useAziende();
  
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
      const searchTerm = searchText || filters.search;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const azienda = aziende.find(a => a.id === servizio.azienda_id);
        const aziendaNome = azienda?.nome?.toLowerCase() || '';
        
        const matches = 
          servizio.numero_commessa?.toLowerCase().includes(searchLower) ||
          servizio.indirizzo_presa.toLowerCase().includes(searchLower) ||
          servizio.indirizzo_destinazione.toLowerCase().includes(searchLower) ||
          aziendaNome.includes(searchLower);
        if (!matches) return false;
      }

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

  const statusCounts = {
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
      <div className="flex flex-col min-h-screen w-full">
        <MobileServiziHeader 
          isAdminOrSocio={isAdminOrSocio}
          onNavigateToNewServizio={onNavigateToNewServizio}
        />
        <div className="flex-1 flex items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen w-full">
        <MobileServiziHeader 
          isAdminOrSocio={isAdminOrSocio}
          onNavigateToNewServizio={onNavigateToNewServizio}
        />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="pt-6">
              <div className="text-center text-destructive">
                Errore nel caricamento dei servizi
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (servizi.length === 0) {
    return (
      <div className="flex flex-col min-h-screen w-full">
        <MobileServiziHeader 
          isAdminOrSocio={isAdminOrSocio}
          onNavigateToNewServizio={onNavigateToNewServizio}
        />
        <div className="flex-1 flex items-center justify-center p-4">
          <EmptyState 
            message="Non ci sono servizi disponibili" 
            showButton={true}
            onCreateNew={onNavigateToNewServizio}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full max-w-full overflow-hidden">
      {/* Header fisso */}
      <div className="shrink-0">
        <MobileServiziHeader 
          isAdminOrSocio={isAdminOrSocio}
          onNavigateToNewServizio={onNavigateToNewServizio}
        />
        
        {/* Stats compatte */}
        <div className="px-4 py-2 bg-primary/5">
          <MobileFirstStats servizi={filteredServizi} isLoading={isLoading} />
        </div>
      </div>

      {/* Search e filtri fissi */}
      <div className="shrink-0">
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

      {/* Tabs fissi */}
      <div className="shrink-0">
        <MobileServiziTabs
          tabs={[
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

      {/* Lista scrollabile */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {serviziByStatus[activeTab as keyof typeof serviziByStatus].length > 0 ? (
          <MobileServiziList
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
          <div className="flex items-center justify-center h-full">
            <EmptyState
              message="Nessun servizio trovato per i criteri selezionati."
              showButton={isAdminOrSocio}
              onCreateNew={onNavigateToNewServizio}
            />
          </div>
        )}
      </div>
    </div>
  );
}