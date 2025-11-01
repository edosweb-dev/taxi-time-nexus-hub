import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DipendenteLayout } from "@/components/layouts/DipendenteLayout";
import { ServiziTabs } from "@/components/dipendente/servizi/ServiziTabs";
import { ServiziFilters, FilterValues } from "@/components/dipendente/servizi/ServiziFilters";
import { ServiziElencoView } from "@/components/dipendente/servizi/ServiziElencoView";
import { ServiziAgendaView } from "@/components/dipendente/servizi/ServiziAgendaView";
import { Badge } from "@/components/ui/badge";
import { useServiziAssegnati, useAziendeForDipendente } from "@/hooks/dipendente/useServiziAssegnati";
import { ServiziFilters as APIFilters } from "@/lib/api/dipendente/servizi";

export default function ServiziAssegnatiPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filters from URL
  const initialFilters: FilterValues = {
    stati: searchParams.get('stati')?.split(',').filter(Boolean) || [],
    dateRange: searchParams.get('dal') && searchParams.get('al') ? {
      start: searchParams.get('dal')!,
      end: searchParams.get('al')!
    } : undefined,
    aziendaId: searchParams.get('azienda') || undefined,
    search: searchParams.get('q') || undefined
  };

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'elenco');
  const [filters, setFilters] = useState<FilterValues>(initialFilters);

  // Fetch data
  const apiFilters: APIFilters = {
    stati: filters.stati.length > 0 ? filters.stati : undefined,
    dateRange: filters.dateRange,
    aziendaId: filters.aziendaId,
    search: filters.search
  };

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useServiziAssegnati(apiFilters);

  const { data: aziende } = useAziendeForDipendente();

  // Flatten paginated data
  const servizi = useMemo(() => {
    const result = data?.pages.flatMap(page => page.data) || [];
    console.log('🔍 Servizi flattened:', { 
      count: result.length, 
      filters,
      isLoading 
    });
    return result;
  }, [data, filters, isLoading]);

  const totalCount = data?.pages[0]?.count || 0;
  const activeCount = servizi.filter(s => s.stato === 'assegnato').length;
  
  console.log('🔍 ServiziAssegnatiPage state:', { 
    totalCount, 
    activeCount, 
    serviziLength: servizi.length,
    currentFilters: filters
  });

  // Handle filter changes and update URL
  const handleFiltersChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    if (newFilters.stati.length > 0) {
      params.set('stati', newFilters.stati.join(','));
    }
    if (newFilters.dateRange) {
      params.set('dal', newFilters.dateRange.start);
      params.set('al', newFilters.dateRange.end);
    }
    if (newFilters.aziendaId) {
      params.set('azienda', newFilters.aziendaId);
    }
    if (newFilters.search) {
      params.set('q', newFilters.search);
    }
    if (activeTab !== 'elenco') {
      params.set('tab', activeTab);
    }
    
    setSearchParams(params, { replace: true });
  };

  const handleResetFilters = () => {
    setFilters({
      stati: [],
      dateRange: undefined,
      aziendaId: undefined,
      search: undefined
    });
    setSearchParams({}, { replace: true });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams);
    if (value !== 'elenco') {
      params.set('tab', value);
    } else {
      params.delete('tab');
    }
    setSearchParams(params, { replace: true });
  };

  const handleViewDetails = (id: string) => {
    navigate(`/dipendente/servizi-assegnati/${id}`);
  };

  const handleCompleta = (id: string) => {
    navigate(`/dipendente/servizi-assegnati/${id}/completa`);
  };

  const handleCardClick = (id: string) => {
    navigate(`/servizi/${id}`);
  };

  return (
    <DipendenteLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">I Miei Servizi</h1>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary">
                {totalCount} totali
              </Badge>
              {activeCount > 0 && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  {activeCount} attivi
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <ServiziTabs 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          agendaView={
            <ServiziAgendaView
              filtri={{
                stati: filters.stati,
                aziendaId: filters.aziendaId
              }}
              onServizioClick={handleCardClick}
              onCompleta={handleCompleta}
            />
          }
        >
          {/* Filters */}
          <ServiziFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            aziende={aziende || []}
          />

          {/* Elenco View */}
          <ServiziElencoView
            servizi={servizi}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage || false}
            onLoadMore={() => fetchNextPage()}
            onViewDetails={handleViewDetails}
            onCompleta={handleCompleta}
            onResetFilters={handleResetFilters}
            onCardClick={handleCardClick}
          />
        </ServiziTabs>
      </div>
    </DipendenteLayout>
  );
}
