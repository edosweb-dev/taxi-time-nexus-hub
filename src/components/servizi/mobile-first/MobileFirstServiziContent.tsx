import { useState, useMemo } from 'react';
import { Loader2, Plus, Filter, Search, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { ServizioStats } from '../ServizioStats';
import { ServiziFilters, type ServiziFiltersState } from '../filters/ServiziFilters';
import { ServizioTable } from '../ServizioTable';
import { useIsMobile } from '@/hooks/use-mobile';

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
      search: '',
      aziendaId: '',
      assigneeId: '',
      dateFrom: undefined,
      dateTo: undefined
    });
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-4 md:space-y-6">
        {isMobile ? (
          <div className="p-4 space-y-4">
            <MobileFirstStats servizi={[]} isLoading={true} />
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        ) : (
          <>
            <ServizioStats servizi={[]} isLoading={true} />
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
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
      <div className="w-full">
        <EmptyState 
          message="Non ci sono servizi disponibili" 
          showButton={true}
          onCreateNew={onNavigateToNewServizio}
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Mobile Header with Stats */}
        <div className="bg-primary text-primary-foreground p-4 space-y-4 -mx-4 -mt-4">
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
        <div className="bg-card border-b p-4 space-y-3 -mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca servizi..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtri
                  {(filters.aziendaId || filters.assigneeId || filters.dateFrom || filters.dateTo) && (
                    <Badge variant="secondary" className="ml-2 text-xs">1</Badge>
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
              <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-xs">
                Pulisci
              </Button>
            )}
          </div>
        </div>

        {/* Status Tabs */}
        <div className="bg-card border-b -mx-4">
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
        <div className="p-4 pb-20 -mx-4">
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

      {/* Desktop Layout */}
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
              onClearFilters={handleClearFilters}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onNavigateToNewServizio}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Report
            </Button>
            <Button variant="outline" size="sm" onClick={onNavigateToNewServizio}>
              <Calendar className="h-4 w-4 mr-2" />
              Calendario
            </Button>
            {isAdminOrSocio && (
              <Button size="sm" onClick={onNavigateToNewServizio}>
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
    </div>
  );
}