import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { useServiziPage } from '@/hooks/useServiziPage';
import { OptimizedMobileServiceCard } from '@/components/servizi/mobile-first/OptimizedMobileServiceCard';
import { useAziende } from '@/hooks/useAziende';

interface MobileOptimizedServiziPageProps {
  onSelectServizio?: (servizio: any) => void;
  onCompleta?: (servizio: any) => void;
  onFirma?: (servizio: any) => void;
}

export function MobileOptimizedServiziPage({ 
  onSelectServizio, 
  onCompleta, 
  onFirma 
}: MobileOptimizedServiziPageProps = {}) {
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
  
  const { aziende } = useAziende();

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
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header with Search */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca servizi..."
            className="pl-10 w-full border-gray-200 focus:border-primary focus:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="sticky top-16 z-10 bg-white border-b px-4 py-3">
        <div className="flex overflow-x-auto scrollbar-hide gap-2" style={{ scrollSnapType: 'x mandatory' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium 
                whitespace-nowrap transition-all duration-200 touch-manipulation
                min-w-fit border flex-shrink-0
                ${activeTab === tab.id 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                }
                min-h-[44px] active:scale-95
              `}
              style={{ scrollSnapAlign: 'start' }}
            >
              <span className="font-medium">{tab.label}</span>
              <div className={`
                flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold
                ${activeTab === tab.id 
                  ? 'bg-primary-foreground text-primary' 
                  : 'bg-white text-gray-600'
                }
              `}>
                {tab.count}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 py-4 space-y-3">
        {filteredServizi.length > 0 ? (
          filteredServizi.map((servizio) => (
            <OptimizedMobileServiceCard
              key={servizio.id}
              servizio={servizio}
              users={users || []}
              aziendaName={servizio.aziende?.nome || aziende?.find(a => a.id === servizio.azienda_id)?.nome || 'Azienda non specificata'}
              onNavigateToDetail={handleNavigateToDetail}
              onSelect={onSelectServizio}
              onCompleta={onCompleta}
              onFirma={onFirma}
              isAdminOrSocio={isAdminOrSocio}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchQuery ? 'Nessun servizio trovato per la ricerca' : 'Nessun servizio disponibile'}
            </p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {isAdminOrSocio && (
        <Button
          onClick={handleNavigateToNewServizio}
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-40 min-h-[56px] min-w-[56px] hover:scale-105 active:scale-95 transition-transform"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}