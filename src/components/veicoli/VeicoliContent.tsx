import { VeicoloList } from './VeicoloList';
import { VeicoliStats } from './VeicoliStats';
import { VeicoloSheet } from './VeicoloSheet';
import { VeicoliMobileHeader } from './VeicoliMobileHeader';
import { VeicoliFilters } from './VeicoliFilters';
import { VeicoloCardMobile } from './VeicoloCardMobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Veicolo, VeicoloFormData } from '@/lib/types/veicoli';
import { useVeicoliSearch } from '@/hooks/useVeicoliSearch';
import { Search } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Stats Cards - Interactive on mobile */}
      <VeicoliStats veicoli={safeVeicoli} onQuickFilter={handleQuickFilter} />

      {/* Mobile Search + Filters */}
      <VeicoliMobileHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCount={totalCount}
        filteredCount={filteredCount}
      />

      <VeicoliFilters
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        veicoli={safeVeicoli}
      />

      {/* Mobile Cards Layout */}
      <div className="md:hidden">
        {filteredCount === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {filteredVeicoli.map(veicolo => (
              <VeicoloCardMobile
                key={veicolo.id}
                veicolo={veicolo}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop Tabs Layout (preserved) */}
      <div className="hidden md:block">
        <Tabs defaultValue="tutti" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="tutti">Tutti</TabsTrigger>
            <TabsTrigger value="attivi">Attivi ({veicoliAttivi.length})</TabsTrigger>
            <TabsTrigger value="inattivi">Inattivi ({veicoliInattivi.length})</TabsTrigger>
          </TabsList>

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
              description="Veicoli non disponibili per i servizi"
              showOnlyInactive={true}
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