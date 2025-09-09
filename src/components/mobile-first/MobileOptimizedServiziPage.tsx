import React, { useState } from 'react';
import { Search, Calendar, MapPin, Clock, User, Plus, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { useServiziPage } from '@/hooks/useServiziPage';
import { MobileLayout } from '@/components/mobile/MobileLayout';

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
      servizio.indirizzo_presa?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = activeTab === 'tutti' || servizio.stato === activeTab.replace('-', '_');

    return matchesSearch && matchesTab;
  }) || [];

  if (!isMobile) {
    return null; // Fallback to regular component
  }

  if (isLoading) {
    return (
      <MobileLayout title="Servizi">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Servizi">
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
        <div className="flex overflow-x-auto scrollbar-hide px-4 py-3 gap-2">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium 
                whitespace-nowrap transition-all duration-300 touch-manipulation
                min-w-fit border shadow-sm
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
                  {servizio.numero_commessa || `Servizio ${servizio.id.slice(0, 8)}`}
                </h3>
                <Badge className={`status-${servizio.stato === 'da_assegnare' ? 'pending' : servizio.stato === 'assegnato' ? 'assigned' : servizio.stato === 'completato' ? 'completed' : 'pending'} mt-1`}>
                  {servizio.stato === 'da_assegnare' ? 'Da Assegnare' :
                   servizio.stato === 'assegnato' ? 'Assegnato' :
                   servizio.stato === 'completato' ? 'Completato' : 'Da Assegnare'}
                </Badge>
              </div>
            </div>

            {/* Info servizio */}
            <div className="space-y-2">
              <div className="service-info">
                <Calendar className="service-info-icon" />
                <span>{new Date(servizio.data_servizio).toLocaleDateString('it-IT')}</span>
              </div>

              <div className="service-info">
                <Clock className="service-info-icon" />
                <span>{servizio.orario_servizio || 'Orario non specificato'}</span>
              </div>

              <div className="service-info">
                <MapPin className="service-info-icon" />
                <span className="line-clamp-1">
                  {servizio.indirizzo_presa || 'Ubicazione non specificata'}
                </span>
              </div>

              {servizio.assegnato_a && (
                <div className="service-info">
                  <User className="service-info-icon" />
                  <span>
                    {users?.find(u => u.id === servizio.assegnato_a)?.email || 'Utente non trovato'}
                  </span>
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
    </MobileLayout>
  );
}