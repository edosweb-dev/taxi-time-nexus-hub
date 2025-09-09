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

      {/* Tabs */}
      <div className="mobile-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`mobile-tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span>{tab.label}</span>
            <Badge className="mobile-badge">
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Lista servizi */}
      <div className="services-list">
        {servizi?.map((servizio) => (
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
        ))}
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