import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DipendenteLayout } from "@/components/layouts/DipendenteLayout";
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SpeseStats } from '@/components/dipendente/spese/SpeseStats';
import { SpeseFilters } from '@/components/dipendente/spese/SpeseFilters';
import { SpeseList } from '@/components/dipendente/spese/SpeseList';
import { SpeseEmptyState } from '@/components/dipendente/spese/SpeseEmptyState';
import { NuovaSpesaSheet } from '@/components/dipendente/spese/NuovaSpesaSheet';
import { SpesaDetailSheet } from '@/components/dipendente/spese/SpesaDetailSheet';
import { useSpesePersonali } from '@/hooks/dipendente/useSpesePersonali';
import { useDebounce } from '@/hooks/use-debounce';

export default function SpesePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filter states
  const [selectedStato, setSelectedStato] = useState<string>(
    searchParams.get('stato') || 'tutte'
  );
  const [dateStart, setDateStart] = useState<string | undefined>(
    searchParams.get('dal') || undefined
  );
  const [dateEnd, setDateEnd] = useState<string | undefined>(
    searchParams.get('al') || undefined
  );
  const [importoMin, setImportoMin] = useState<number | undefined>();
  const [importoMax, setImportoMax] = useState<number | undefined>();
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Sheet states
  const [nuovaSpesaOpen, setNuovaSpesaOpen] = useState(false);
  const [selectedSpesaId, setSelectedSpesaId] = useState<string | null>(null);

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Build filters object
  const filters = useMemo(() => ({
    stato: selectedStato,
    dateStart,
    dateEnd,
    importoMin,
    importoMax,
    search: debouncedSearch || undefined,
  }), [selectedStato, dateStart, dateEnd, importoMin, importoMax, debouncedSearch]);

  // Fetch data
  const { spese, stats, isLoading } = useSpesePersonali(filters);

  // Sync filters to URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedStato && selectedStato !== 'tutte') {
      params.set('stato', selectedStato);
    }
    if (dateStart) params.set('dal', dateStart);
    if (dateEnd) params.set('al', dateEnd);
    setSearchParams(params, { replace: true });
  }, [selectedStato, dateStart, dateEnd, setSearchParams]);

  const handleStatoChange = (stato: string) => {
    setSelectedStato(stato);
  };

  const handleAdvancedFiltersChange = (advFilters: {
    dateStart?: string;
    dateEnd?: string;
    importoMin?: number;
    importoMax?: number;
    search?: string;
  }) => {
    setDateStart(advFilters.dateStart);
    setDateEnd(advFilters.dateEnd);
    setImportoMin(advFilters.importoMin);
    setImportoMax(advFilters.importoMax);
    setSearchQuery(advFilters.search || '');
  };

  const handleResetFilters = () => {
    setSelectedStato('tutte');
    setDateStart(undefined);
    setDateEnd(undefined);
    setImportoMin(undefined);
    setImportoMax(undefined);
    setSearchQuery('');
    setSearchParams({}, { replace: true });
  };

  const handleNuovaSpesa = () => {
    setNuovaSpesaOpen(true);
  };

  const handleSpesaClick = (spesaId: string) => {
    setSelectedSpesaId(spesaId);
  };
  
  // Find selected spesa
  const selectedSpesa = selectedSpesaId 
    ? spese.find(s => s.id === selectedSpesaId) || null
    : null;

  // Determine empty state type
  const hasAnySpese = spese.length > 0;
  const hasFiltersApplied = selectedStato !== 'tutte' || dateStart || dateEnd || 
    importoMin !== undefined || importoMax !== undefined || debouncedSearch;

  return (
    <DipendenteLayout title="Le Mie Spese">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Le Mie Spese</h1>
          <Button onClick={handleNuovaSpesa} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuova Spesa
          </Button>
        </div>

        {/* Stats */}
        {!isLoading && hasAnySpese && (
          <SpeseStats stats={stats} />
        )}

        {/* Filters */}
        <SpeseFilters
          selectedStato={selectedStato}
          onStatoChange={handleStatoChange}
          onAdvancedFiltersChange={handleAdvancedFiltersChange}
          onReset={handleResetFilters}
        />

        {/* List or Empty State */}
        {!isLoading && spese.length === 0 && (
          <SpeseEmptyState
            type={hasFiltersApplied ? 'no-results' : 'no-spese'}
            onNuovaSpesa={!hasFiltersApplied ? handleNuovaSpesa : undefined}
            onResetFilters={hasFiltersApplied ? handleResetFilters : undefined}
          />
        )}

        {(isLoading || spese.length > 0) && (
          <SpeseList
            spese={spese}
            isLoading={isLoading}
            onSpesaClick={handleSpesaClick}
          />
        )}
      </div>

      {/* Nuova Spesa Sheet */}
      <NuovaSpesaSheet 
        open={nuovaSpesaOpen} 
        onOpenChange={setNuovaSpesaOpen}
      />

      {/* Spesa Detail Sheet */}
      <SpesaDetailSheet
        spesa={selectedSpesa}
        open={!!selectedSpesaId}
        onClose={() => setSelectedSpesaId(null)}
      />
    </DipendenteLayout>
  );
}
