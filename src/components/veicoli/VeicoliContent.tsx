import { VeicoloList } from './VeicoloList';
import { VeicoliStats } from './VeicoliStats';
import { VeicoloSheet } from './VeicoloSheet';
import { SmartSearchBar } from './SmartSearchBar';
import { QuickFilterTabs } from './QuickFilterTabs';
import { VeicoloCardEnhanced } from './VeicoloCardEnhanced';
import { FloatingActionButton } from './FloatingActionButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Veicolo, VeicoloFormData } from '@/lib/types/veicoli';
import { useVeicoliSearch } from '@/hooks/useVeicoliSearch';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface VeicoliContentProps {
  veicoli: Veicolo[];
  onEdit: (veicolo: Veicolo) => void;
  onDelete: (veicolo: Veicolo) => void;
  onAddVeicolo: () => void;
  onSubmit: (data: VeicoloFormData) => Promise<void>;
  isSheetOpen: boolean;
  setIsSheetOpen: (open: boolean) => void;
  selectedVeicolo: Veicolo | undefined;
  isSubmitting: boolean;
}

export function VeicoliContent({
  veicoli,
  onEdit,
  onDelete,
  onAddVeicolo,
  onSubmit,
  isSheetOpen,
  setIsSheetOpen,
  selectedVeicolo,
  isSubmitting,
}: VeicoliContentProps) {
  // Handle undefined veicoli
  const safeVeicoli = veicoli || [];
  
  // Mobile filter state - default to 'active' as per requirements
  const [mobileQuickFilter, setMobileQuickFilter] = useState<'all' | 'active' | 'inactive'>('active');
  
  // Use search and filter hook
  const {
    searchQuery,
    setSearchQuery,
    activeFilters,
    filteredVeicoli,
    totalCount,
    filteredCount,
    handleFilterChange,
    handleQuickFilter
  } = useVeicoliSearch(safeVeicoli);

  // Apply quick filter on top of search results
  const displayedVeicoli = filteredVeicoli.filter(v => {
    if (mobileQuickFilter === 'active') return v.attivo;
    if (mobileQuickFilter === 'inactive') return !v.attivo;
    return true;
  });

  // Desktop tabs filtering (preserved for desktop)
  const veicoliAttivi = safeVeicoli.filter(v => v.attivo);
  const veicoliInattivi = safeVeicoli.filter(v => !v.attivo);

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-12 md:py-16">
      <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">
        {searchQuery.trim() ? 'Nessun veicolo trovato' : 'Nessun veicolo disponibile'}
      </h3>
      <p className="text-muted-foreground mb-4">
        {searchQuery.trim() 
          ? `Nessun risultato per "${searchQuery}"`
          : mobileQuickFilter === 'active' 
            ? 'Nessun veicolo attivo. Aggiungi il primo veicolo alla tua flotta.'
            : mobileQuickFilter === 'inactive'
              ? 'Nessun veicolo inattivo.'
              : 'Aggiungi il primo veicolo alla tua flotta'
        }
      </p>
      {searchQuery.trim() && (
        <button 
          onClick={() => setSearchQuery('')}
          className="text-sm text-primary hover:underline"
        >
          Cancella ricerca
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen md:space-y-6 -mx-4 md:mx-0">
      {/* MOBILE LAYOUT - Enhanced UI */}
      <div className="md:hidden">
        {/* Smart Search Bar - Sticky */}
        <SmartSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalCount={totalCount}
          filteredCount={filteredCount}
          sticky={true}
        />

        {/* Quick Filter Tabs */}
        <QuickFilterTabs
          veicoli={safeVeicoli}
          activeFilter={mobileQuickFilter}
          onFilterChange={setMobileQuickFilter}
        />

        {/* Cards Grid - Compact spacing */}
        <div className="px-3 pt-2 pb-24 space-y-2">
          {displayedVeicoli.length === 0 ? (
            <EmptyState />
          ) : (
            displayedVeicoli.map(veicolo => (
              <VeicoloCardEnhanced
                key={veicolo.id}
                veicolo={veicolo}
                onEdit={onEdit}
              />
            ))
          )}
        </div>

        {/* Floating Action Button */}
        <FloatingActionButton onClick={onAddVeicolo} />
      </div>

      {/* Desktop Tabs Layout - Default to Attivi */}
      <div className="hidden md:block">
        <Tabs defaultValue="attivi" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="attivi">Attivi ({veicoliAttivi.length})</TabsTrigger>
            <TabsTrigger value="inattivi">Inattivi ({veicoliInattivi.length})</TabsTrigger>
            <TabsTrigger value="tutti">Tutti ({safeVeicoli.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="attivi" className="space-y-4">
            <VeicoloList 
              veicoli={veicoliAttivi}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddVeicolo={onAddVeicolo}
              title="Veicoli Attivi"
              description="Veicoli disponibili per i servizi"
              showOnlyActive={true}
            />
          </TabsContent>

          <TabsContent value="inattivi" className="space-y-4">
            <VeicoloList 
              veicoli={veicoliInattivi}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddVeicolo={onAddVeicolo}
              title="Veicoli Inattivi"
              description="Veicoli non disponibili - possono essere riattivati o eliminati definitivamente"
              showOnlyInactive={true}
            />
          </TabsContent>

          <TabsContent value="tutti" className="space-y-4">
            <VeicoloList 
              veicoli={safeVeicoli}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddVeicolo={onAddVeicolo}
              title="Tutti i Veicoli"
              description="Gestione completa della flotta veicoli"
            />
          </TabsContent>
        </Tabs>
      </div>

      <VeicoloSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        veicolo={selectedVeicolo}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
