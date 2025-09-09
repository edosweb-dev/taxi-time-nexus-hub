import React, { useState } from 'react';
import { Search, Calendar, MapPin, Clock, User, Star, Filter, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function MobileUIShowcase() {
  const [activeTab, setActiveTab] = useState('tutti');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'tutti', label: 'Tutti', count: 24 },
    { id: 'da-assegnare', label: 'Da Assegnare', count: 8 },
    { id: 'assegnati', label: 'Assegnati', count: 12 },
    { id: 'completati', label: 'Completati', count: 4 }
  ];

  const mockServices = [
    {
      id: 1,
      title: 'Servizio Aeroporto Malpensa',
      status: 'da-assegnare',
      time: '14:30',
      date: '15 Gen 2025',
      location: 'Via Roma 123, Milano',
      client: 'Mario Rossi',
      price: '€ 45,00'
    },
    {
      id: 2,
      title: 'Transfer Stazione Central',
      status: 'assegnato',
      time: '09:15',
      date: '15 Gen 2025',
      location: 'Piazza Duca d\'Aosta, Milano',
      client: 'Laura Bianchi',
      price: '€ 25,00'
    },
    {
      id: 3,
      title: 'Corsa Centro Storico',
      status: 'completato',
      time: '16:45',
      date: '14 Gen 2025',
      location: 'Duomo di Milano',
      client: 'Giuseppe Verdi',
      price: '€ 18,50'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'da-assegnare':
        return <Badge className="mobile-badge status-pending">Da Assegnare</Badge>;
      case 'assegnato':
        return <Badge className="mobile-badge status-assigned">Assegnato</Badge>;
      case 'completato':
        return <Badge className="mobile-badge status-completed">Completato</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="mobile-container min-h-screen bg-background">
      {/* 1. Header Mobile Ottimizzato */}
      <div className="mobile-header">
        <div className="flex items-center justify-between">
          <h1 className="mobile-heading">Servizi</h1>
          <Button size="sm" className="mobile-button">
            <Plus className="w-4 h-4 mr-1" />
            Nuovo
          </Button>
        </div>
      </div>

      <div className="mobile-content">
        {/* 2. Search Bar Mobile Perfezionata */}
        <div className="mobile-search">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground search-icon" />
            <Input
              placeholder="Cerca servizio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mobile-input search-input pl-10"
            />
          </div>
        </div>

        {/* 3. Tabs Mobile Ottimizzati */}
        <div className="mobile-tabs tabs-container">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`mobile-tab tab-button ${
                activeTab === tab.id ? 'active' : ''
              }`}
            >
              {tab.label}
              <span className="ml-2 mobile-badge tab-badge">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* 4. Lista Servizi con Cards Ottimizzate */}
        <div className="mobile-section">
          <div className="space-y-3 px-4">
            {mockServices.map((service) => (
              <div
                key={service.id}
                className="mobile-card service-card touch-feedback cursor-pointer"
              >
                {/* Header della card */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="mobile-subheading flex-1 pr-2">
                    {service.title}
                  </h3>
                  {getStatusBadge(service.status)}
                </div>

                {/* Info servizio con icone */}
                <div className="space-y-2">
                  <div className="service-info">
                    <Clock className="service-info-icon" />
                    <span>{service.time} - {service.date}</span>
                  </div>
                  
                  <div className="service-info">
                    <MapPin className="service-info-icon" />
                    <span className="flex-1">{service.location}</span>
                  </div>
                  
                  <div className="service-info">
                    <User className="service-info-icon" />
                    <span>{service.client}</span>
                  </div>
                </div>

                {/* Footer della card */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
                  <span className="mobile-text font-semibold text-foreground">
                    {service.price}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="mobile-caption">4.8</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-20 right-4 z-40">
          <Button 
            size="lg" 
            className="mobile-button w-14 h-14 rounded-full shadow-lg"
          >
            <Filter className="w-5 h-5" />
          </Button>
        </div>

        {/* 5. Demo Typography Mobile */}
        <div className="mobile-section">
          <div className="mobile-card">
            <h2 className="mobile-heading">Typography Demo</h2>
            <h3 className="mobile-subheading">Sottotitolo ottimizzato</h3>
            <p className="mobile-text mb-2">
              Testo del corpo ottimizzato per la lettura mobile con line-height 
              appropriato e dimensioni che garantiscono leggibilità.
            </p>
            <p className="mobile-caption">
              Caption text per informazioni secondarie
            </p>
          </div>
        </div>

        {/* 6. Demo Touch Targets */}
        <div className="mobile-section">
          <div className="mobile-card">
            <h3 className="mobile-subheading mb-3">Touch Targets (44px min)</h3>
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="mobile-button touch-target">
                <Calendar className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="mobile-button touch-target">
                <MapPin className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="mobile-button touch-target">
                <User className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Bottom Navigation Demo */}
      <div className="mobile-nav bottom-navigation">
        <div className="flex justify-around items-center h-16">
          {[
            { icon: Calendar, label: 'Servizi', active: true },
            { icon: MapPin, label: 'Mappa', active: false },
            { icon: Clock, label: 'Orari', active: false },
            { icon: User, label: 'Profilo', active: false }
          ].map((item, index) => (
            <button
              key={index}
              className={`mobile-nav-item bottom-nav-item ${
                item.active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <item.icon className="mobile-nav-icon bottom-nav-icon" />
              <span className="mobile-nav-text bottom-nav-text">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}