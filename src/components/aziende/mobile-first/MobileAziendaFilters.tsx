import { useState, useRef, useCallback, useEffect } from 'react';

interface FilterOption {
  id: string;
  label: string;
  count: number;
}

interface MobileAziendaFiltersProps {
  aziende: any[];
  referentiByAzienda: Record<string, any[]>;
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
}

export function MobileAziendaFilters({ 
  aziende, 
  referentiByAzienda, 
  activeFilter, 
  onFilterChange 
}: MobileAziendaFiltersProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const filters: FilterOption[] = [
    { 
      id: 'tutte', 
      label: 'Tutte', 
      count: aziende?.length || 0 
    },
    { 
      id: 'con-firma', 
      label: 'Con Firma', 
      count: aziende?.filter(a => a.firma_digitale_attiva).length || 0 
    },
    { 
      id: 'con-provvigione', 
      label: 'Con Provvigione', 
      count: aziende?.filter(a => a.provvigione).length || 0 
    },
    { 
      id: 'senza-referenti', 
      label: 'Senza Referenti', 
      count: aziende?.filter(a => !referentiByAzienda[a.id] || referentiByAzienda[a.id].length === 0).length || 0 
    },
  ];

  // Touch handlers
  const handleTouchStart = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchMove = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setTimeout(() => setIsDragging(false), 100);
  }, []);

  const handleFilterClick = useCallback((filterId: string) => {
    if (isDragging) return;
    onFilterChange(filterId);
  }, [isDragging, onFilterChange]);

  // Event listeners
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div className="filters-container-parent sticky top-[116px] z-10 bg-background border-b md:hidden">
      <div 
        ref={scrollContainerRef}
        className="filters-scroll-isolated flex px-4 py-3 gap-2 scroll-smooth snap-x snap-mandatory"
      >
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleFilterClick(filter.id);
            }}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium 
              whitespace-nowrap transition-all duration-300 touch-manipulation
              min-w-fit border shadow-sm min-h-[44px] snap-start flex-shrink-0
              ${activeFilter === filter.id 
                ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                : 'bg-background text-muted-foreground border-border hover:bg-muted'
              }
            `}
          >
            <span className="font-semibold">{filter.label}</span>
            <div className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold bg-background/20">
              {filter.count}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
