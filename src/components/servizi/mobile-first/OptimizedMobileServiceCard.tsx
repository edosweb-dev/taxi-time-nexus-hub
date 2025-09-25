import React, { useState } from 'react';
import { Clock, User, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Servizio } from '@/lib/types/servizi';
import { Profile } from '@/lib/types';

interface OptimizedMobileServiceCardProps {
  servizio: Servizio;
  users: Profile[];
  aziendaName: string;
  onNavigateToDetail: (id: string) => void;
  onSelect?: (servizio: Servizio) => void;
  onCompleta?: (servizio: Servizio) => void;
  onFirma?: (servizio: Servizio) => void;
  isAdminOrSocio: boolean;
}

export function OptimizedMobileServiceCard({
  servizio,
  users,
  aziendaName,
  onNavigateToDetail,
  onSelect,
  onCompleta,
  onFirma,
  isAdminOrSocio
}: OptimizedMobileServiceCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getStatusBadge = (stato: string) => {
    const statusConfig = {
      'da_assegnare': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', label: 'Da Assegnare' },
      'assegnato': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', label: 'Assegnato' },
      'completato': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', label: 'Completato' },
      'annullato': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', label: 'Annullato' }
    };
    
    const config = statusConfig[stato as keyof typeof statusConfig] || statusConfig['da_assegnare'];
    
    return (
      <Badge className={`${config.bg} ${config.text} ${config.border} text-xs font-medium px-2 py-1`}>
        {config.label}
      </Badge>
    );
  };

  const getAssignedUser = () => {
    if (servizio.assegnato_a) {
      const user = users.find(u => u.id === servizio.assegnato_a);
      return user ? `${user.first_name} ${user.last_name}` : 'Utente';
    }
    if (servizio.conducente_esterno) {
      return servizio.conducente_esterno_nome || 'Conducente esterno';
    }
    return null;
  };

  const formatDateTime = (data: string, orario?: string) => {
    const date = new Date(data).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return `${date} - ${orario || 'Orario non specificato'}`;
  };

  const getActionButton = () => {
    if (!isAdminOrSocio) return null;

    switch (servizio.stato) {
      case 'da_assegnare':
        return (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(servizio);
            }}
            className="flex-1 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            Assegna
          </Button>
        );
      case 'assegnato':
        return (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onCompleta?.(servizio);
            }}
            className="flex-1 min-h-[44px] bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            Completa
          </Button>
        );
      case 'completato':
        return (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onFirma?.(servizio);
            }}
            className="flex-1 min-h-[44px] bg-purple-600 hover:bg-purple-700 text-white"
            size="sm"
          >
            Firma
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 w-full touch-manipulation hover:shadow-md transition-shadow duration-200">
      {/* HEADER COMPATTO */}
      <div className="flex items-center justify-between mb-3">
        {getStatusBadge(servizio.stato)}
        <span className="text-sm text-gray-500 font-mono">#{servizio.numero_commessa}</span>
      </div>
      
      {/* INFO PRIMARIA SEMPRE VISIBILE */}
      <div className="space-y-2 mb-3">
        <h3 
          className="font-semibold text-lg text-gray-900 leading-tight cursor-pointer hover:text-primary transition-colors"
          onClick={() => onNavigateToDetail(servizio.id)}
        >
          {aziendaName}
        </h3>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
          <span className="font-medium">{formatDateTime(servizio.data_servizio, servizio.orario_servizio)}</span>
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">{servizio.metodo_pagamento || 'Contanti'}</span>
          <span className="mx-2">•</span>
          <span className="font-semibold text-green-600">
            €{servizio.incasso_previsto ? servizio.incasso_previsto.toFixed(2) : '0.00'}
          </span>
        </div>
      </div>
      
      {/* DETTAGLI ESPANDIBILI */}
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleContent className="space-y-3 py-3 border-t border-gray-100">
          <div className="space-y-2">
            <div className="flex items-start">
              <div className="w-3 h-3 bg-green-500 rounded-full mt-1 mr-3 flex-shrink-0"></div>
              <div className="text-sm text-gray-700 flex-1">
                <div className="font-medium text-gray-500 text-xs uppercase tracking-wide mb-1">Partenza</div>
                <div>{servizio.indirizzo_presa}</div>
                {servizio.citta_presa && (
                  <div className="text-gray-500">{servizio.citta_presa}</div>
                )}
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-3 h-3 bg-red-500 rounded-full mt-1 mr-3 flex-shrink-0"></div>
              <div className="text-sm text-gray-700 flex-1">
                <div className="font-medium text-gray-500 text-xs uppercase tracking-wide mb-1">Destinazione</div>
                <div>{servizio.indirizzo_destinazione}</div>
                {servizio.citta_destinazione && (
                  <div className="text-gray-500">{servizio.citta_destinazione}</div>
                )}
              </div>
            </div>
          </div>
          
          {getAssignedUser() && (
            <div className="flex items-center bg-blue-50 rounded-lg p-3">
              <User className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
              <span className="text-sm font-medium text-blue-900">{getAssignedUser()}</span>
            </div>
          )}

          {servizio.note && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="font-medium text-gray-500 text-xs uppercase tracking-wide mb-1">Note</div>
              <div className="text-sm text-gray-700">{servizio.note}</div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
      
      {/* ACTIONS TOUCH-OPTIMIZED */}
      <div className="flex gap-2 mt-4">
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="flex-1 py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50 border-gray-200 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] flex items-center justify-center gap-2"
          >
            {expanded ? 'Nascondi dettagli' : 'Mostra dettagli'}
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        {getActionButton()}
      </div>
    </div>
  );
}