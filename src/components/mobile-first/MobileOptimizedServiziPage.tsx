import React, { useState } from 'react';
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

  const tabs = [
    { id: 'tutti', label: 'Tutti', count: servizi?.length || 0 },
    { id: 'da-assegnare', label: 'Da Assegnare', count: servizi?.filter(s => s.stato === 'da_assegnare').length || 0 },
    { id: 'assegnati', label: 'Assegnati', count: servizi?.filter(s => s.stato === 'assegnato').length || 0 },
    { id: 'completati', label: 'Completati', count: servizi?.filter(s => s.stato === 'completato').length || 0 }
  ];

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
    <>
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

      {/* Enhanced Mobile Tabs */}
      <div className="bg-background/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-30">
        <div 
          className="flex overflow-x-auto scrollbar-hide px-4 py-3 gap-2 scroll-smooth snap-x snap-mandatory"
          style={{
            touchAction: 'pan-x',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium 
                whitespace-nowrap transition-all duration-300 touch-manipulation
                min-w-fit border shadow-sm flex-shrink-0 snap-start min-h-[44px]
                ${activeTab === tab.id 
                  ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105' 
                  : 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground hover:border-border/80'
                }
                active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1
              `}
              style={{
                transformOrigin: 'center',
                transform: activeTab === tab.id ? 'translateY(-1px)' : 'none'
              }}
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
        
        {/* Subtle gradient fade on scroll */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background/95 to-transparent pointer-events-none" />
      </div>

      {/* Lista servizi */}
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
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg touch-target z-40"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </>
  );
}