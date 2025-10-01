import { useState, useMemo } from 'react';
import { Veicolo } from '@/lib/types/veicoli';

interface FilterState {
  stato: string[];
  posti: string[];
}

export function useVeicoliSearch(veicoli: Veicolo[] = []) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    stato: [],
    posti: []
  });

  // Search filtering
  const searchFilteredVeicoli = useMemo(() => {
    if (!searchQuery.trim()) return veicoli;
    
    const query = searchQuery.toLowerCase().trim();
    
    return veicoli.filter(veicolo => 
      veicolo.targa.toLowerCase().includes(query) ||
      veicolo.modello.toLowerCase().includes(query) ||
      (veicolo.colore && veicolo.colore.toLowerCase().includes(query))
    );
  }, [veicoli, searchQuery]);

  // Combined search + filters
  const filteredVeicoli = useMemo(() => {
    let result = searchFilteredVeicoli;

    // Apply stato filters
    if (activeFilters.stato.length > 0) {
      result = result.filter(veicolo => {
        if (activeFilters.stato.includes('attivo') && veicolo.attivo) return true;
        if (activeFilters.stato.includes('inattivo') && !veicolo.attivo) return true;
        return false;
      });
    }

    // Apply posti filters
    if (activeFilters.posti.length > 0) {
      result = result.filter(veicolo => {
        const posti = veicolo.numero_posti || 0;
        
        if (activeFilters.posti.includes('4+') && posti >= 4) return true;
        if (activeFilters.posti.includes('7+') && posti >= 7) return true;
        if (activeFilters.posti.includes('9+') && posti >= 9) return true;
        return false;
      });
    }

    return result;
  }, [searchFilteredVeicoli, activeFilters]);

  const handleFilterChange = (type: 'stato' | 'posti' | 'clear', value?: string) => {
    if (type === 'clear') {
      setActiveFilters({ stato: [], posti: [] });
      return;
    }

    if (!value) return;

    setActiveFilters(prev => {
      const currentFilters = prev[type];
      const isActive = currentFilters.includes(value);

      return {
        ...prev,
        [type]: isActive
          ? currentFilters.filter(f => f !== value)
          : [...currentFilters, value]
      };
    });
  };

  const handleQuickFilter = (filterType: string) => {
    // Clear existing filters
    setSearchQuery('');
    
    switch (filterType) {
      case 'all':
        setActiveFilters({ stato: [], posti: [] });
        break;
      case 'attivo':
        setActiveFilters({ stato: ['attivo'], posti: [] });
        break;
      case 'inattivo':
        setActiveFilters({ stato: ['inattivo'], posti: [] });
        break;
      case '7+':
        setActiveFilters({ stato: [], posti: ['7+'] });
        break;
      default:
        break;
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    activeFilters,
    filteredVeicoli,
    totalCount: veicoli.length,
    filteredCount: filteredVeicoli.length,
    handleFilterChange,
    handleQuickFilter
  };
}
