import React, { useState } from 'react';
import { Loader2, Plus, Search, Filter, MapPin, Calendar, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useServiziPage } from '@/hooks/useServiziPage';
import { useAziende } from '@/hooks/useAziende';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Servizio } from '@/lib/types/servizi';

export default function MobileServiziPage() {
  const {
    servizi,
    isLoading,
    error,
    users,
    isAdminOrSocio,
    handleNavigateToDetail,
    handleNavigateToNewServizio,
  } = useServiziPage();

  const { aziende } = useAziende();
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('tutti');

  // Filtra i servizi per testo di ricerca
  const filteredServizi = servizi.filter(servizio => {
    const searchLower = searchText.toLowerCase();
    const azienda = aziende.find(a => a.id === servizio.azienda_id);
    const aziendaNome = azienda?.nome?.toLowerCase() || '';
    
    const matchesSearch = !searchText || 
      servizio.numero_commessa?.toLowerCase().includes(searchLower) ||
      servizio.indirizzo_presa.toLowerCase().includes(searchLower) ||
      servizio.indirizzo_destinazione.toLowerCase().includes(searchLower) ||
      aziendaNome.includes(searchLower);

    const matchesStatus = selectedStatus === 'tutti' || servizio.stato === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Conteggio per status
  const statusCounts = {
    tutti: servizi.length,
    da_assegnare: servizi.filter(s => s.stato === 'da_assegnare').length,
    assegnato: servizi.filter(s => s.stato === 'assegnato').length,
    completato: servizi.filter(s => s.stato === 'completato').length,
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      da_assegnare: { label: 'Da Assegnare', color: 'bg-red-500' },
      assegnato: { label: 'Assegnato', color: 'bg-yellow-500' },
      completato: { label: 'Completato', color: 'bg-green-500' },
      annullato: { label: 'Annullato', color: 'bg-gray-500' },
      consuntivato: { label: 'Consuntivato', color: 'bg-blue-500' },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { label: status, color: 'bg-gray-400' };
    
    return (
      <span className={`${config.color} text-white text-xs px-2 py-1 rounded-full`}>
        {config.label}
      </span>
    );
  };

  const getAziendaNome = (aziendaId: string) => {
    const azienda = aziende.find(a => a.id === aziendaId);
    return azienda?.nome || 'N/A';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 bg-primary text-white p-4 shadow-lg">
          <h1 className="text-xl font-bold text-center">Servizi Mobile</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 bg-primary text-white p-4 shadow-lg">
          <h1 className="text-xl font-bold text-center">Servizi Mobile</h1>
        </div>
        <div className="p-4">
          <Card className="border-red-200">
            <CardContent className="p-4 text-center text-red-600">
              Errore nel caricamento dei servizi
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fisso */}
      <div className="sticky top-0 z-50 bg-primary text-white shadow-lg">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">Servizi Mobile</h1>
          {isAdminOrSocio && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleNavigateToNewServizio}
              className="bg-white text-primary hover:bg-gray-100"
            >
              <Plus className="h-4 w-4 mr-1" />
              Nuovo
            </Button>
          )}
        </div>

        {/* Stats compatte */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-white/10 rounded-lg p-2">
              <div className="text-lg font-bold">{statusCounts.tutti}</div>
              <div className="text-xs">Totali</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="text-lg font-bold">{statusCounts.da_assegnare}</div>
              <div className="text-xs">Da Assegnare</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="text-lg font-bold">{statusCounts.assegnato}</div>
              <div className="text-xs">Assegnati</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="text-lg font-bold">{statusCounts.completato}</div>
              <div className="text-xs">Completati</div>
            </div>
          </div>
        </div>
      </div>

      {/* Ricerca e filtri */}
      <div className="sticky top-20 z-40 bg-white border-b p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cerca servizi..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: 'tutti', label: 'Tutti' },
            { key: 'da_assegnare', label: 'Da Assegnare' },
            { key: 'assegnato', label: 'Assegnati' },
            { key: 'completato', label: 'Completati' },
          ].map((status) => (
            <button
              key={status.key}
              onClick={() => setSelectedStatus(status.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedStatus === status.key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.label} ({statusCounts[status.key as keyof typeof statusCounts] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Lista servizi */}
      <div className="p-4 pb-20 space-y-3">
        {filteredServizi.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              {searchText ? 'Nessun servizio trovato per la ricerca' : 'Nessun servizio disponibile'}
            </CardContent>
          </Card>
        ) : (
          filteredServizi.map((servizio) => (
            <Card
              key={servizio.id}
              className="cursor-pointer hover:shadow-md transition-shadow active:scale-98"
              onClick={() => handleNavigateToDetail(servizio.id)}
            >
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm mb-1">
                      {servizio.numero_commessa || `#${servizio.id.slice(0, 8)}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getAziendaNome(servizio.azienda_id)}
                    </div>
                  </div>
                  {getStatusBadge(servizio.stato)}
                </div>

                {/* Data e ora */}
                <div className="flex items-center gap-4 mb-3 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(servizio.data_servizio), 'dd/MM/yyyy', { locale: it })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{servizio.orario_servizio}</span>
                  </div>
                </div>

                {/* Indirizzi */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
                    <span className="text-xs text-gray-700 line-clamp-1">
                      <strong>Da:</strong> {servizio.indirizzo_presa}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3 w-3 mt-0.5 text-red-600 flex-shrink-0" />
                    <span className="text-xs text-gray-700 line-clamp-1">
                      <strong>A:</strong> {servizio.indirizzo_destinazione}
                    </span>
                  </div>
                </div>

                {/* Footer con passeggeri e assegnazione */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Users className="h-3 w-3" />
                    <span>Passeggeri</span>
                  </div>
                  
                  {servizio.assegnato_a && (
                    <div className="text-xs text-gray-600">
                      Assegnato a: {users.find(u => u.id === servizio.assegnato_a)?.first_name || 'N/A'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}