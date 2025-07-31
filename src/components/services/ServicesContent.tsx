import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServizi } from '@/hooks/useServizi';
import { useUsers } from '@/hooks/useUsers';
import { useAziende } from '@/hooks/useAziende';
import { usePasseggeriCounts } from '@/components/servizi/hooks';
import { groupServiziByStatus } from '@/components/servizi/utils';
import { Servizio, StatoServizio } from '@/lib/types/servizi';
import { Profile, Azienda } from '@/lib/types';
import { Loader2, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ServicesHeader } from './ServicesHeader';
import { ServicesTabs } from './ServicesTabs';
import { ServiceCard } from './ServiceCard';
import { ServicesFilters } from './ServicesFilters';
import { ServiziDialogManager } from '@/components/servizi/page/ServiziDialogManager';
import { EmptyState } from '@/components/servizi/EmptyState';

interface ServiceFilters {
  aziendaId: string;
  assigneeId: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}

export function ServicesContent() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<StatoServizio>('da_assegnare');
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ServiceFilters>({
    aziendaId: '',
    assigneeId: '',
    dateFrom: undefined,
    dateTo: undefined
  });

  // Dialog states
  const [selectedServizio, setSelectedServizio] = useState<Servizio | null>(null);
  const [showAssegnazioneDialog, setShowAssegnazioneDialog] = useState(false);

  const { servizi, isLoading, error, refetch } = useServizi();
  const { users } = useUsers({ excludeRoles: ['cliente'] });
  const { aziende } = useAziende();

  // Filter and search logic
  const filteredServizi = useMemo(() => {
    let filtered = servizi;

    // Search filter
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(servizio => {
        const azienda = aziende.find(a => a.id === servizio.azienda_id);
        const assignedUser = users.find(u => u.id === servizio.assegnato_a);
        
        return (
          servizio.id?.toLowerCase().includes(searchLower) ||
          servizio.numero_commessa?.toLowerCase().includes(searchLower) ||
          azienda?.nome?.toLowerCase().includes(searchLower) ||
          servizio.indirizzo_presa?.toLowerCase().includes(searchLower) ||
          servizio.indirizzo_destinazione?.toLowerCase().includes(searchLower) ||
          servizio.note?.toLowerCase().includes(searchLower) ||
          assignedUser?.first_name?.toLowerCase().includes(searchLower) ||
          assignedUser?.last_name?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Company filter
    if (filters.aziendaId) {
      filtered = filtered.filter(s => s.azienda_id === filters.aziendaId);
    }

    // Assignee filter
    if (filters.assigneeId) {
      filtered = filtered.filter(s => s.assegnato_a === filters.assigneeId);
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      filtered = filtered.filter(s => {
        const serviceDate = new Date(s.data_servizio);
        const fromMatch = !filters.dateFrom || serviceDate >= filters.dateFrom;
        const toMatch = !filters.dateTo || serviceDate <= filters.dateTo;
        return fromMatch && toMatch;
      });
    }

    return filtered;
  }, [servizi, searchText, filters, aziende, users]);

  const { passeggeriCounts } = usePasseggeriCounts(filteredServizi);
  const groupedServizi = groupServiziByStatus(filteredServizi);

  // Calculate status counts
  const statusCounts = Object.keys(groupedServizi).reduce((acc, status) => {
    acc[status as StatoServizio] = groupedServizi[status as StatoServizio].length;
    return acc;
  }, {} as Record<StatoServizio, number>);

  const handleNavigateToDetail = (id: string) => {
    navigate(`/servizi/${id}`);
  };

  const handleAssign = (servizio: Servizio) => {
    setSelectedServizio(servizio);
    setShowAssegnazioneDialog(true);
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

  const handleCloseDialogs = () => {
    setSelectedServizio(null);
    setShowAssegnazioneDialog(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-muted-foreground">Caricamento servizi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-destructive mb-4">Errore nel caricamento dei servizi</p>
        <Button onClick={() => refetch()} variant="outline">
          Riprova
        </Button>
      </div>
    );
  }

  const currentServizi = groupedServizi[activeTab] || [];

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <ServicesHeader servizi={servizi} />

      {/* Search and Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca servizi..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-10"
          />
        </div>
        <Sheet open={showFilters} onOpenChange={setShowFilters}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[80vh]">
            <SheetHeader>
              <SheetTitle>Filtri Servizi</SheetTitle>
            </SheetHeader>
            <ServicesFilters
              servizi={servizi}
              users={users}
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={handleClearFilters}
              onClose={() => setShowFilters(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Status Tabs */}
      <ServicesTabs 
        statusCounts={statusCounts}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Services List */}
      <div className="space-y-3">
        {currentServizi.length === 0 ? (
          <EmptyState
            message="Nessun servizio trovato per i criteri selezionati."
            showButton={false}
          />
        ) : (
          currentServizi.map((servizio) => (
            <ServiceCard
              key={servizio.id}
              servizio={servizio}
              aziende={aziende}
              users={users}
              passeggeriCount={passeggeriCounts[servizio.id] || 0}
              onNavigateToDetail={handleNavigateToDetail}
              onAssign={handleAssign}
            />
          ))
        )}
      </div>

      {/* Dialog Manager */}
      <ServiziDialogManager
        onRefetch={refetch}
        selectedServizio={selectedServizio}
        showAssegnazioneDialog={showAssegnazioneDialog}
        setShowAssegnazioneDialog={setShowAssegnazioneDialog}
        showCompletaDialog={false}
        setShowCompletaDialog={() => {}}
        showFirmaDialog={false}
        setShowFirmaDialog={() => {}}
        onClose={handleCloseDialogs}
      />
    </div>
  );
}