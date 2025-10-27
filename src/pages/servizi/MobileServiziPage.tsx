import React, { useState } from 'react';
import { Loader2, Plus, Search, Filter, MapPin, Calendar, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InserimentoServizioModal } from '@/components/servizi/InserimentoServizioModal';
import { useServiziPage } from '@/hooks/useServiziPage';
import { useAziende } from '@/hooks/useAziende';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Servizio } from '@/lib/types/servizi';

export default function MobileServiziPage() {
  // This component is now wrapped by MainLayout in ServiziPage
  // Remove the header and just return content
  const {
    servizi,
    isLoading,
    error,
    users,
    isAdminOrSocio,
    handleNavigateToDetail,
  } = useServiziPage();

  const { aziende } = useAziende();
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('tutti');
  const [showModal, setShowModal] = useState(false);

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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Card className="border-red-200">
          <CardContent className="p-4 text-center text-red-600">
            Errore nel caricamento dei servizi
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-full overflow-x-hidden">
      {/* Stats compatte */}
      <div className="px-3 pb-3 bg-primary text-white">
        <div className="grid grid-cols-4 gap-1 text-center">
          <div className="bg-white/10 rounded p-1.5">
            <div className="text-sm font-bold">{statusCounts.tutti}</div>
            <div className="text-xs">Totali</div>
          </div>
          <div className="bg-white/10 rounded p-1.5">
            <div className="text-sm font-bold">{statusCounts.da_assegnare}</div>
            <div className="text-xs">Da Ass.</div>
          </div>
          <div className="bg-white/10 rounded p-1.5">
            <div className="text-sm font-bold">{statusCounts.assegnato}</div>
            <div className="text-xs">Assegnati</div>
          </div>
          <div className="bg-white/10 rounded p-1.5">
            <div className="text-sm font-bold">{statusCounts.completato}</div>
            <div className="text-xs">Completati</div>
          </div>
        </div>
        
        {/* Action button in header */}
        {isAdminOrSocio && (
          <div className="mt-3 flex justify-end">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowModal(true)}
              className="bg-white text-primary hover:bg-gray-100 text-xs px-2 py-1 h-7"
            >
              <Plus className="h-3 w-3 mr-1" />
              Nuovo
            </Button>
          </div>
        )}
      </div>

      {/* Inserimento Servizio Modal */}
      <InserimentoServizioModal 
        open={showModal}
        onClose={() => setShowModal(false)}
      />

      {/* Ricerca e filtri */}
      <div className="sticky top-16 z-40 bg-white border-b px-3 py-2 space-y-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
          <Input
            placeholder="Cerca..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-7 h-8 text-sm"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { key: 'tutti', label: 'Tutti' },
            { key: 'da_assegnare', label: 'Da Ass.' },
            { key: 'assegnato', label: 'Assegnati' },
            { key: 'completato', label: 'Completati' },
          ].map((status) => (
            <button
              key={status.key}
              onClick={() => setSelectedStatus(status.key)}
              className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                selectedStatus === status.key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {status.label} ({statusCounts[status.key as keyof typeof statusCounts] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Lista servizi */}
      <div className="px-2 py-2 pb-20 space-y-2">
        {filteredServizi.length === 0 ? (
          <Card className="mx-1">
            <CardContent className="p-4 text-center text-gray-500 text-sm">
              {searchText ? 'Nessun servizio trovato' : 'Nessun servizio disponibile'}
            </CardContent>
          </Card>
        ) : (
          filteredServizi.map((servizio) => (
            <Card
              key={servizio.id}
              className="cursor-pointer hover:shadow-md transition-shadow active:scale-98 mx-1"
              onClick={() => handleNavigateToDetail(servizio.id)}
            >
              <CardContent className="p-3">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm mb-0.5">
                      {servizio.numero_commessa || `#${servizio.id.slice(0, 6)}`}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {getAziendaNome(servizio.azienda_id)}
                    </div>
                  </div>
                  {getStatusBadge(servizio.stato)}
                </div>

                {/* Data e ora */}
                <div className="flex items-center gap-3 mb-2 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(servizio.data_servizio), 'dd/MM', { locale: it })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{servizio.orario_servizio}</span>
                  </div>
                </div>

                {/* Indirizzi */}
                <div className="space-y-1 mb-2">
                  <div className="flex items-start gap-1">
                    <MapPin className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
                    <span className="text-xs text-gray-700 line-clamp-1 leading-tight">
                      {servizio.indirizzo_presa}
                    </span>
                  </div>
                  <div className="flex items-start gap-1">
                    <MapPin className="h-3 w-3 mt-0.5 text-red-600 flex-shrink-0" />
                    <span className="text-xs text-gray-700 line-clamp-1 leading-tight">
                      {servizio.indirizzo_destinazione}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                {servizio.assegnato_a && (
                  <div className="pt-1 border-t border-gray-100">
                    <div className="text-xs text-gray-600 truncate">
                      Assegnato: {users.find(u => u.id === servizio.assegnato_a)?.first_name || 'N/A'}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}