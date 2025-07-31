import { useState, useMemo } from 'react';
import { Loader2, Plus, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '../EmptyState';
import { groupServiziByStatus } from '../utils/groupingUtils';
import { Servizio } from '@/lib/types/servizi';
import { Profile } from '@/lib/types';
import { useAziende } from '@/hooks/useAziende';
import { usePasseggeriCounts } from '../hooks/usePasseggeriCounts';
import { MobileFirstStats } from './MobileFirstStats';
import { MobileFirstTabs } from './MobileFirstTabs';
import { MobileFirstServiceList } from './MobileFirstServiceList';
import { MobileFirstFilters } from './MobileFirstFilters';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface MobileFirstServiziContentProps {
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

export function MobileFirstServiziContent({
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
}: MobileFirstServiziContentProps) {
  const { aziende } = useAziende();
  const [activeTab, setActiveTab] = useState<string>('da_assegnare');
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    aziendaId: '',
    assigneeId: '',
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined
  });

  // Filter servizi based on search and filters
  const filteredServizi = useMemo(() => {
    return servizi.filter(servizio => {
      // Search filter
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const azienda = aziende.find(a => a.id === servizio.azienda_id);
        const aziendaNome = azienda?.nome?.toLowerCase() || '';
        
        const matches = 
          servizio.numero_commessa?.toLowerCase().includes(searchLower) ||
          servizio.indirizzo_presa.toLowerCase().includes(searchLower) ||
          servizio.indirizzo_destinazione.toLowerCase().includes(searchLower) ||
          aziendaNome.includes(searchLower);
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
      aziendaId: '',
      assigneeId: '',
      dateFrom: undefined,
      dateTo: undefined
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <MobileFirstStats servizi={[]} isLoading={true} />
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4">
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
      <div className="min-h-screen bg-background p-4">
        <EmptyState 
          message="Non ci sono servizi disponibili" 
          showButton={true}
          onCreateNew={onNavigateToNewServizio}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header with Stats */}
      <div className="bg-primary text-primary-foreground p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Servizi</h1>
          {isAdminOrSocio && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onNavigateToNewServizio}
              className="text-xs"
            >
              <Plus className="h-4 w-4 mr-1" />
              Nuovo
            </Button>
          )}
        </div>
        
        <MobileFirstStats servizi={filteredServizi} isLoading={isLoading} />
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-card border-b p-4 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca servizi..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters and Clear Button */}
        <div className="flex items-center gap-2">
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtri
                {(filters.aziendaId || filters.assigneeId || filters.dateFrom || filters.dateTo) && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    1
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>Filtri Avanzati</SheetTitle>
              </SheetHeader>
              <MobileFirstFilters
                servizi={servizi}
                users={users}
                filters={filters}
                onFiltersChange={setFilters}
                onClose={() => setShowFilters(false)}
              />
            </SheetContent>
          </Sheet>
          
          {(searchText || filters.aziendaId || filters.assigneeId || filters.dateFrom || filters.dateTo) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearFilters}
              className="text-xs"
            >
              Pulisci
            </Button>
          )}
        </div>
      </div>

      {/* Status Tabs */}
      <div className="bg-card border-b">
        <MobileFirstTabs
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

      {/* Service List */}
      <div className="flex-1 p-4 pb-20">
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