import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Calendar, MapPin, Clock, User, Plus, Filter, Calendar as CalendarIcon } from 'lucide-react';
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
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const tabs = [
    { id: 'tutti', label: 'Tutti', count: servizi?.length || 0 },
    { id: 'da-assegnare', label: 'Da Assegnare', count: servizi?.filter(s => s.stato === 'da_assegnare').length || 0 },
    { id: 'assegnati', label: 'Assegnati', count: servizi?.filter(s => s.stato === 'assegnato').length || 0 },
    { id: 'completati', label: 'Completati', count: servizi?.filter(s => s.stato === 'completato').length || 0 }
  ];

  // Gestione eventi touch per isolare scroll
  const handleTouchStart = useCallback((e) => {
    setIsDragging(false);
  }, []);

  const handleTouchMove = useCallback((e) => {
    setIsDragging(true);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setTimeout(() => setIsDragging(false), 100);
  }, []);

  // Click handler che previene azione se stai scrollando
  const handleFiltroClick = useCallback((filtroId) => {
    if (isDragging) return; // Non cambiare filtro se stavi scrollando
    
    setActiveTab(filtroId);
  }, [isDragging]);

  // DEBUG DIMENSIONI PAGINA
  useEffect(() => {
    console.log('📱 DIMENSIONI PAGINA:');
    console.log('window.innerWidth:', window.innerWidth);
    console.log('document.body.scrollWidth:', document.body.scrollWidth);
    console.log('document.body.clientWidth:', document.body.clientWidth);
    console.log('Overflow check:', document.body.scrollWidth > window.innerWidth ? '❌ OVERFLOW!' : '✅ OK');
    
    // Identifica elementi che causano overflow
    const elements = document.querySelectorAll('*');
    elements.forEach(el => {
      if (el.scrollWidth > window.innerWidth) {
        console.log('⚠️ Elemento overflow:', el.className, 'scrollWidth:', el.scrollWidth);
      }
    });
  }, []);

  // Applica eventi al container
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

  // DEBUG - Console logging per troubleshooting
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    console.log('🔍 FILTRI DEBUG:');
    console.log('Container scrollWidth:', container.scrollWidth);
    console.log('Container clientWidth:', container.clientWidth); 
    console.log('Should scroll:', container.scrollWidth > container.clientWidth);
    console.log('Computed overflow-x:', getComputedStyle(container).overflowX);
    console.log('Computed touch-action:', getComputedStyle(container).touchAction);
    
    // Test scroll programmatico
    container.scrollLeft = 50;
    setTimeout(() => {
      console.log('Scroll test - scrollLeft after 50px:', container.scrollLeft);
    }, 100);
  }, [tabs]);

  // Filter services based on active tab and search
  const filteredServizi = servizi?.filter(servizio => {
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

  if (!isMobile) {
    return null; // Fallback to regular component
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="page-container-safe mobile-layout-safe">
      {/* Search */}
      <div className="mobile-search">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca servizi..."
            className="mobile-input pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* CTA Buttons - Minimal */}
      <div className="px-4 py-2 border-b border-border/30">
        <div className="flex gap-2">
          <Button 
            onClick={() => window.location.href = '/report-servizi'}
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs gap-1"
          >
            <Calendar className="w-3 h-3" />
            Report
          </Button>
          
          <Button 
            onClick={() => window.location.href = '/calendario-servizi'}
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs gap-1"
          >
            <CalendarIcon className="w-3 h-3" />
            Calendario  
          </Button>
        </div>
      </div>

      {/* FILTRI CON CONTENIMENTO CHIRURGICO */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div 
          ref={scrollContainerRef}
          className="filters-scroll-isolated flex px-4 py-3 gap-2 scroll-smooth snap-x snap-mandatory"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              data-tab={tab.id}
              data-active={activeTab === tab.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleFiltroClick(tab.id);
              }}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium 
                whitespace-nowrap transition-all duration-300 touch-manipulation
                min-w-fit border shadow-sm min-h-[44px] snap-start flex-shrink-0
                ${activeTab === tab.id 
                  ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105' 
                  : 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground hover:border-border/80'
                }
                active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1
              `}
            >
              <span className="font-semibold">{tab.label}</span>
              <div className={`
                flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold
                transition-colors duration-200
                ${activeTab === tab.id 
                  ? 'bg-primary-foreground text-primary' 
                  : 'bg-muted text-muted-foreground'
                }
              `}>
                {tab.count}
              </div>
              
              {/* Active indicator */}
              {activeTab === tab.id && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lista servizi con contenimento normale */}
      <div className="services-list">
        {filteredServizi.length > 0 ? (
          filteredServizi.map((servizio) => (
          <div
            key={servizio.id}
            className="mobile-card touch-feedback"
            onClick={() => handleNavigateToDetail(servizio.id)}
          >
            {/* Header servizio */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="mobile-subheading line-clamp-2">
                  {servizio.aziende?.nome || 'Azienda non specificata'}
                </h3>
                {servizio.numero_commessa && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Commessa: {servizio.numero_commessa}
                  </div>
                )}
                <Badge className={`status-${servizio.stato === 'da_assegnare' ? 'pending' : servizio.stato === 'assegnato' ? 'assigned' : servizio.stato === 'completato' ? 'completed' : 'pending'} mt-1`}>
                  {servizio.stato === 'da_assegnare' ? 'Da Assegnare' :
                   servizio.stato === 'assegnato' ? 'Assegnato' :
                   servizio.stato === 'completato' ? 'Completato' : 'Da Assegnare'}
                </Badge>
              </div>
              
              {/* Metodo pagamento */}
              <div className="ml-3 text-right">
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
            <div className="space-y-2">
              <div className="service-info">
                <Calendar className="service-info-icon" />
                <span>{new Date(servizio.data_servizio).toLocaleDateString('it-IT')}</span>
                <div className="ml-auto text-xs text-muted-foreground">
                  {servizio.orario_servizio || 'Orario non specificato'}
                </div>
              </div>

              {/* Percorso completo */}
              <div className="bg-muted/30 rounded-lg p-2 space-y-1.5">
                <div className="service-info">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2" />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">Partenza</div>
                    <span className="text-sm font-medium line-clamp-1">
                      {servizio.indirizzo_presa}
                    </span>
                    {servizio.citta_presa && (
                      <div className="text-xs text-muted-foreground">{servizio.citta_presa}</div>
                    )}
                  </div>
                </div>
                
                <div className="ml-1 border-l-2 border-dashed border-muted-foreground/30 h-4"></div>
                
                <div className="service-info">
                  <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2" />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">Destinazione</div>
                    <span className="text-sm font-medium line-clamp-1">
                      {servizio.indirizzo_destinazione}
                    </span>
                    {servizio.citta_destinazione && (
                      <div className="text-xs text-muted-foreground">{servizio.citta_destinazione}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Assegnazione e veicolo */}
              <div className="flex gap-2">
                {servizio.assegnato_a && (
                  <div className="service-info flex-1">
                    <User className="service-info-icon" />
                    <span className="text-sm">
                      {users?.find(u => u.id === servizio.assegnato_a)?.first_name || 'Utente'} {users?.find(u => u.id === servizio.assegnato_a)?.last_name || ''}
                    </span>
                  </div>
                )}
                
                {servizio.conducente_esterno && (
                  <div className="service-info flex-1">
                    <User className="service-info-icon" />
                    <span className="text-sm">
                      {servizio.conducente_esterno_nome || 'Conducente esterno'}
                    </span>
                  </div>
                )}
              </div>

              {/* Info aggiuntive */}
              {(servizio.ore_effettive || servizio.note) && (
                <div className="pt-2 border-t border-border/50 space-y-1">
                  {servizio.ore_effettive && (
                    <div className="service-info">
                      <Clock className="service-info-icon" />
                      <span className="text-sm">
                        {servizio.ore_effettive}h lavorative
                      </span>
                    </div>
                  )}
                  
                  {servizio.note && (
                    <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2 line-clamp-2">
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
            <p className="mobile-text text-muted-foreground">
              {searchQuery ? 'Nessun servizio trovato per la ricerca' : 'Nessun servizio disponibile'}
            </p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {isAdminOrSocio && (
        <Button
          onClick={handleNavigateToNewServizio}
          className="fixed bottom-32 right-4 h-12 w-12 rounded-full shadow-lg touch-target z-40"
          size="icon"
        >
          <Plus className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}