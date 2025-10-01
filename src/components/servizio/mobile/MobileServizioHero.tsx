import React from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Phone, MessageCircle, Navigation, Clock, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatoServizio } from '@/lib/types/servizi';

interface MobileServizioHeroProps {
  servizio: {
    id: string;
    cliente: { nome: string; telefono?: string };
    data: string | Date;
    orario: string;
    stato: StatoServizio;
    autista?: { nome: string; telefono?: string; avatar?: string };
    pickup: { indirizzo: string; citta: string };
    destinazione: { indirizzo: string; citta: string };
    durata?: string;
    distanza?: string;
  };
  isAdmin?: boolean;
  onAssegnaServizio?: () => void;
}

export function MobileServizioHero({ servizio, isAdmin = false, onAssegnaServizio }: MobileServizioHeroProps) {
  // stato badge handled via local config
  
  // Get the badge properties for styling
  const getBadgeConfig = () => {
    switch (servizio.stato) {
      case 'da_assegnare':
        return { variant: 'destructive' as const, bg: 'bg-red-50', label: 'Da Assegnare' };
      case 'assegnato':
        return { variant: 'secondary' as const, bg: 'bg-blue-50', label: 'Assegnato' };
      case 'completato':
        return { variant: 'outline' as const, bg: 'bg-green-50', label: 'Completato' };
      case 'consuntivato':
        return { variant: 'default' as const, bg: 'bg-green-100', label: 'Consuntivato' };
      case 'annullato':
        return { variant: 'destructive' as const, bg: 'bg-red-100', label: 'Annullato' };
      case 'non_accettato':
        return { variant: 'destructive' as const, bg: 'bg-orange-50', label: 'Non Accettato' };
      default:
        return { variant: 'secondary' as const, bg: 'bg-gray-50', label: servizio.stato };
    }
  };

  const badgeConfig = getBadgeConfig();

  const formattedDate = (() => {
    const raw: any = servizio.data;
    const d: Date = raw instanceof Date ? raw : new Date(raw);
    if (!d || isNaN(d.getTime())) return 'Data non disponibile';
    try {
      return format(d, 'EEEE d MMMM yyyy', { locale: it });
    } catch {
      return 'Data non disponibile';
    }
  })();

  const handleCall = (numero: string) => {
    window.open(`tel:${numero}`, '_self');
  };

  const handleMessage = (numero: string) => {
    window.open(`sms:${numero}`, '_self');
  };

  const handleNavigate = (indirizzo: string) => {
    const query = encodeURIComponent(indirizzo);
    window.open(`https://maps.google.com/?q=${query}`, '_blank');
  };

  return (
    <div className={`mobile-hero-card compact mt-5 ${badgeConfig.bg}`}>
      {/* Header compatto con Cliente e Stato */}
      <div className="hero-header compact">
        <div className="cliente-info">
          <h1 className="cliente-nome compact">{servizio.cliente.nome}</h1>
          <Badge variant={badgeConfig.variant} className="stato-badge compact">
            {badgeConfig.label}
          </Badge>
        </div>
        
        {servizio.cliente.telefono && (
          <div className="cliente-actions compact">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCall(servizio.cliente.telefono!)}
              className="action-button compact"
            >
              <Phone className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleMessage(servizio.cliente.telefono!)}
              className="action-button compact"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Data e Ora compatte */}
      <div className="datetime-section compact">
        <Clock className="datetime-icon compact" />
        <div className="datetime-info compact">
          <span className="date-text compact">
            {formattedDate}
          </span>
          <span className="time-text compact">{servizio.orario}</span>
        </div>
        
        {(servizio.durata || servizio.distanza) && (
          <div className="datetime-meta compact">
            {servizio.durata && <span className="text-xs">{servizio.durata}</span>}
            {servizio.distanza && <span className="text-xs">{servizio.distanza}</span>}
          </div>
        )}
      </div>

      {/* Percorso compatto */}
      <div className="route-section compact">
        <div className="route-point pickup compact">
          <div className="route-indicator compact">
            <div className="route-dot pickup-dot compact"></div>
          </div>
          <div className="route-content compact">
            <div className="route-label compact">Ritiro</div>
            <div className="route-address compact" onClick={() => handleNavigate(servizio.pickup.indirizzo)}>
              <span className="text-sm">{servizio.pickup.indirizzo}</span>
              <span className="route-city compact text-xs">{servizio.pickup.citta}</span>
            </div>
          </div>
        </div>

        <div className="route-line compact"></div>

        <div className="route-point destination compact">
          <div className="route-indicator compact">
            <div className="route-dot destination-dot compact"></div>
          </div>
          <div className="route-content compact">
            <div className="route-label compact">Destinazione</div>
            <div className="route-address compact" onClick={() => handleNavigate(servizio.destinazione.indirizzo)}>
              <span className="text-sm">{servizio.destinazione.indirizzo}</span>
              <span className="route-city compact text-xs">{servizio.destinazione.citta}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Autista compatto */}
      {servizio.autista ? (
        <div className="autista-section compact">
          <div className="autista-info compact">
            <Avatar className="autista-avatar compact">
              <AvatarImage src={servizio.autista.avatar} />
              <AvatarFallback className="text-xs">
                {servizio.autista.nome.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="autista-details compact">
              <span className="autista-label compact text-xs">Autista</span>
              <span className="autista-nome compact text-sm">{servizio.autista.nome}</span>
            </div>
          </div>
          
          {servizio.autista.telefono && (
            <div className="autista-actions compact">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCall(servizio.autista.telefono!)}
                className="action-button compact"
              >
                <Phone className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMessage(servizio.autista.telefono!)}
                className="action-button compact"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div 
          className={`no-autista-section compact ${isAdmin && servizio.stato === 'da_assegnare' ? 'clickable' : ''}`}
          onClick={isAdmin && servizio.stato === 'da_assegnare' ? onAssegnaServizio : undefined}
        >
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="no-autista-text compact text-sm">
            {isAdmin && servizio.stato === 'da_assegnare' 
              ? 'Tocca per assegnare il servizio' 
              : 'Nessun autista assegnato'
            }
          </span>
          {isAdmin && servizio.stato === 'da_assegnare' && (
            <span className="assign-hint">👆</span>
          )}
        </div>
      )}
    </div>
  );
}