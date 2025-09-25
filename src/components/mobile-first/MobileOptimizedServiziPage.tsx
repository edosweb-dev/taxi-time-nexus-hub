import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search, Calendar, MapPin, Clock, User, Plus, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { useServiziPage } from '@/hooks/useServiziPage';
import { MainLayout } from '@/components/layouts/MainLayout';

export function MobileOptimizedServiziPage() {
  const {
    servizi,
    isLoading,
    error,
    users,
    isAdminOrSocio,
    isMobile,
    refetch,
    handleNavigateToDetail,
    handleNavigateToNewServizio,
  } = useServiziPage();

  const [activeTab, setActiveTab] = useState('tutti');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Scroll management state
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  
  // Touch isolation state (CRITICO per isolare swipe)
  const [touchStart, setTouchStart] = useState<{x: number, y: number, time: number} | null>(null);
  
  // Memoized tabs to prevent unnecessary recalculations
  const tabsData = React.useMemo(() => [
    { id: 'tutti', label: 'Tutti', count: servizi?.length || 0 },
    { id: 'da-assegnare', label: 'Da Assegnare', count: servizi?.filter(s => s.stato === 'da_assegnare').length || 0 },
    { id: 'assegnati', label: 'Assegnati', count: servizi?.filter(s => s.stato === 'assegnato').length || 0 },
    { id: 'completati', label: 'Completati', count: servizi?.filter(s => s.stato === 'completato').length || 0 }
  ], [servizi]);


  // Optimized filter function with useMemo
  const filteredServizi = React.useMemo(() => {
    return servizi?.filter(servizio => {
      const matchesSearch = !searchQuery || 
        servizio.numero_commessa?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        servizio.indirizzo_presa?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        servizio.aziende?.nome?.toLowerCase().includes(searchQuery.toLowerCase());

      // Map tab IDs to actual service states
      let matchesTab = false;
      switch (activeTab) {
        case 'tutti':
          matchesTab = true;
          break;
        case 'da-assegnare':
          matchesTab = servizio.stato === 'da_assegnare';
          break;
        case 'assegnati':
          matchesTab = servizio.stato === 'assegnato';
          break;
        case 'completati':
          matchesTab = servizio.stato === 'completato';
          break;
        default:
          matchesTab = false;
      }

      return matchesSearch && matchesTab;
    }) || [];
  }, [servizi, searchQuery, activeTab]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const currentIndex = tabsData.findIndex(tab => tab.id === activeTab);
      const nextIndex = e.key === 'ArrowRight' 
        ? Math.min(currentIndex + 1, tabsData.length - 1)
        : Math.max(currentIndex - 1, 0);
      
      setActiveTab(tabsData[nextIndex].id);
    }
  }, [activeTab, tabsData]);
  
  // Scroll management logic (ottimizzato)
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    
    setIsScrolling(true);
    const timeout = setTimeout(() => setIsScrolling(false), 150);
    return () => clearTimeout(timeout);
  }, []);

  // STEP 1 - TOUCH ISOLATION HANDLERS (CRITICO per isolare swipe)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStart.x);
    const deltaY = Math.abs(touch.clientY - touchStart.y);
    
    // CRITICO: Se movimento orizzontale > verticale, blocca completamente eventi sulla pagina
    if (deltaX > deltaY && deltaX > 5) {
      e.preventDefault(); // Impedisce scroll verticale pagina
      e.stopPropagation(); // Ferma propagazione a elementi padre
      
      // Forza il container a rimanere nella sua area
      const container = scrollContainerRef.current;
      if (container) {
        container.style.overflowY = 'hidden'; // Blocca temporaneamente scroll verticale
      }
    }
  }, [touchStart]);

  const handleTouchEnd = useCallback(() => {
    setTouchStart(null);
    
    // Ripristina scroll normale dopo touch
    const container = scrollContainerRef.current;
    if (container) {
      container.style.overflowY = ''; // Ripristina scroll verticale
    }
  }, []);

  // Setup scroll listeners and initial state
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    // Check initial scroll state
    handleScroll();
    
    // Add scroll listener with passive for performance
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Auto-scroll to active tab when it changes
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const activeButton = container.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement;
    if (activeButton) {
      activeButton.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest',
        inline: 'center' 
      });
    }
  }, [activeTab]);

  // Responsive resize handler
  useEffect(() => {
    const handleResize = () => {
      handleScroll();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleScroll]);

  if (!isMobile) {
    return null; // Fallback to regular component
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header - Sticky */}
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca servizi..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Enhanced Mobile Tabs with Complete Isolation */}
      <div className="sticky top-[69px] z-10 bg-background border-b overflow-hidden">
        <div 
          className="relative px-4 py-3"
          style={{
            isolation: 'isolate', // Isola completamente il layer
            contain: 'layout style paint', // Ottimizzazione contenimento
          }}
        >
          {/* Left fade indicator */}
          <div 
            className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background via-background/80 to-transparent z-20 pointer-events-none transition-opacity duration-200 ${
              canScrollLeft ? 'opacity-100' : 'opacity-0'
            }`} 
          />
          
          {/* Right fade indicator */}
          <div 
            className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background via-background/80 to-transparent z-20 pointer-events-none transition-opacity duration-200 ${
              canScrollRight ? 'opacity-100' : 'opacity-0'
            }`} 
          />
          
          {/* Scroll indicator dots */}
          {canScrollRight && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-30 pointer-events-none">
              <div className="flex gap-0.5">
                <div className="w-1 h-1 bg-primary/40 rounded-full animate-pulse" />
                <div className="w-1 h-1 bg-primary/60 rounded-full animate-pulse delay-75" />
                <div className="w-1 h-1 bg-primary/80 rounded-full animate-pulse delay-150" />
              </div>
            </div>
          )}
          
          {/* Isolated horizontal scroll container */}
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto scrollbar-hide gap-3 scroll-smooth snap-x snap-mandatory pb-1 -mb-1"
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            role="tablist"
            aria-label="Filtri servizi"
            tabIndex={0}
            style={{
              touchAction: 'pan-x', // SOLO scroll orizzontale
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              willChange: isScrolling ? 'transform' : 'auto',
              isolation: 'isolate', // Isolamento completo
              contain: 'layout', // Contiene il layout
              overflowY: 'hidden', // Blocca esplicitamente scroll verticale
              height: 'auto', // Altezza fissa per contenere l'area
              minHeight: '44px' // Altezza minima per touch
            }}
          >
            {tabsData.map((tab, index) => (
              <button
                key={tab.id}
                data-tab={tab.id}
                data-active={activeTab === tab.id}
                onClick={(e) => {
                  e.preventDefault(); // Previene comportamenti indesiderati
                  e.stopPropagation(); // Blocca propagazione evento
                  setActiveTab(tab.id);
                }}
                onTouchStart={(e) => e.stopPropagation()} // Isola touch eventi del pulsante
                onTouchEnd={(e) => e.stopPropagation()} // Isola touch eventi del pulsante
                role="tab"
                tabIndex={activeTab === tab.id ? 0 : -1}
                aria-selected={activeTab === tab.id}
                aria-setsize={tabsData.length}
                aria-posinset={index + 1}
                aria-label={`${tab.label} - ${tab.count} servizi`}
                className={`
                  relative flex items-center gap-2 px-5 py-2.5 rounded-full font-medium 
                  whitespace-nowrap transition-all duration-200 touch-manipulation
                  min-w-fit border shadow-sm min-h-[44px] snap-start flex-shrink-0
                  active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                  text-xs sm:text-sm
                  xs:px-4 xs:gap-1.5 xs:py-2
                  ${activeTab === tab.id 
                    ? 'bg-primary text-primary-foreground border-primary shadow-md ring-2 ring-primary/20' 
                    : 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground hover:border-border/60'
                  }
                `}
              >
                <span className="font-semibold text-xs sm:text-sm truncate max-w-[120px] xs:max-w-[80px]">{tab.label}</span>
                <div className={`
                  flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold
                  transition-colors duration-200 border flex-shrink-0
                  xs:min-w-[18px] xs:h-4 xs:px-1 xs:text-[10px]
                  ${activeTab === tab.id 
                    ? 'bg-primary-foreground text-primary border-primary-foreground' 
                    : 'bg-muted text-muted-foreground border-muted-foreground/20'
                  }
                `}>
                  {tab.count}
                </div>
                
                {/* Active tab indicator */}
                {activeTab === tab.id && (
                  <div className="absolute -bottom-[1px] left-1/2 transform -translate-x-1/2 w-4 h-1 bg-primary rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area - Scrollable */}
      <div className="px-4 py-4 space-y-4">
        {filteredServizi.length > 0 ? (
          filteredServizi.map((servizio) => (
            <div
              key={servizio.id}
              className="bg-card rounded-lg shadow-sm border border-border p-4 w-full touch-manipulation hover:shadow-md transition-shadow active:scale-[0.98] transition-transform"
              onClick={() => handleNavigateToDetail(servizio.id)}
            >
              {/* Header servizio */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-foreground leading-tight truncate">
                    {servizio.aziende?.nome || 'Azienda non specificata'}
                  </h3>
                  {servizio.numero_commessa && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Commessa: {servizio.numero_commessa}
                    </div>
                  )}
                  <Badge 
                    variant={
                      servizio.stato === 'da_assegnare' ? 'destructive' :
                      servizio.stato === 'assegnato' ? 'secondary' :
                      servizio.stato === 'completato' ? 'default' : 'destructive'
                    }
                    className="mt-1"
                  >
                    {servizio.stato === 'da_assegnare' ? 'Da Assegnare' :
                     servizio.stato === 'assegnato' ? 'Assegnato' :
                     servizio.stato === 'completato' ? 'Completato' : 'Da Assegnare'}
                  </Badge>
                </div>
                
                {/* Metodo pagamento */}
                <div className="ml-3 text-right flex-shrink-0">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    {servizio.metodo_pagamento || 'N/A'}
                  </div>
                  {servizio.incasso_previsto && (
                    <div className="text-sm font-semibold text-primary">
                      €{servizio.incasso_previsto.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Info principale servizio */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>{new Date(servizio.data_servizio).toLocaleDateString('it-IT')}</span>
                  <div className="ml-auto text-xs">
                    {servizio.orario_servizio || 'Orario non specificato'}
                  </div>
                </div>

                {/* Percorso completo */}
                <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground">Partenza</div>
                      <span className="text-sm font-medium leading-tight break-words">
                        {servizio.indirizzo_presa}
                      </span>
                      {servizio.citta_presa && (
                        <div className="text-xs text-muted-foreground">{servizio.citta_presa}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-1.5 border-l-2 border-dashed border-muted-foreground/30 h-4"></div>
                  
                  <div className="flex items-start gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground">Destinazione</div>
                      <span className="text-sm font-medium leading-tight break-words">
                        {servizio.indirizzo_destinazione}
                      </span>
                      {servizio.citta_destinazione && (
                        <div className="text-xs text-muted-foreground">{servizio.citta_destinazione}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Assegnazione e veicolo */}
                {(servizio.assegnato_a || servizio.conducente_esterno) && (
                  <div className="flex gap-2">
                    {servizio.assegnato_a && (
                      <div className="flex items-center gap-2 flex-1 text-sm text-muted-foreground">
                        <User className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                          {users?.find(u => u.id === servizio.assegnato_a)?.first_name || 'Utente'} {users?.find(u => u.id === servizio.assegnato_a)?.last_name || ''}
                        </span>
                      </div>
                    )}
                    
                    {servizio.conducente_esterno && (
                      <div className="flex items-center gap-2 flex-1 text-sm text-muted-foreground">
                        <User className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                          {servizio.conducente_esterno_nome || 'Conducente esterno'}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Info aggiuntive */}
                {(servizio.ore_effettive || servizio.note) && (
                  <div className="pt-2 border-t border-border/50 space-y-2">
                    {servizio.ore_effettive && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {servizio.ore_effettive}h lavorative
                        </span>
                      </div>
                    )}
                    
                    {servizio.note && (
                      <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
                        <strong>Note:</strong> {servizio.note}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchQuery ? 'Nessun servizio trovato per la ricerca' : 'Nessun servizio disponibile'}
            </p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {isAdminOrSocio && (
        <Button
          onClick={handleNavigateToNewServizio}
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-40 min-h-[56px] min-w-[56px]"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}