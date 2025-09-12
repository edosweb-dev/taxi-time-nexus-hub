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
    <div className={`mobile-hero-card ${badgeConfig.bg}`}>
      {/* Header con Cliente e Stato */}
      <div className="hero-header">
        <div className="cliente-info">
          <h1 className="cliente-nome">{servizio.cliente.nome}</h1>
          <Badge variant={badgeConfig.variant} className="stato-badge">
            {badgeConfig.label}
          </Badge>
        </div>
        
        {servizio.cliente.telefono && (
          <div className="cliente-actions">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCall(servizio.cliente.telefono!)}
              className="action-button"
            >
              <Phone className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleMessage(servizio.cliente.telefono!)}
              className="action-button"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Data e Ora Prominenti */}
      <div className="datetime-section">
        <div className="datetime-primary">
          <Clock className="datetime-icon" />
          <div className="datetime-info">
            <span className="date-text">
              {formattedDate}
            </span>
            <span className="time-text">{servizio.orario}</span>
          </div>
        </div>
        
        {(servizio.durata || servizio.distanza) && (
          <div className="datetime-meta">
            {servizio.durata && <span>{servizio.durata}</span>}
            {servizio.distanza && <span>{servizio.distanza}</span>}
          </div>
        )}
      </div>

      {/* Percorso */}
      <div className="route-section">
        <div className="route-point pickup">
          <div className="route-indicator">
            <div className="route-dot pickup-dot"></div>
          </div>
          <div className="route-content">
            <div className="route-label">Ritiro</div>
            <div className="route-address" onClick={() => handleNavigate(servizio.pickup.indirizzo)}>
              <span>{servizio.pickup.indirizzo}</span>
              <span className="route-city">{servizio.pickup.citta}</span>
            </div>
          </div>
        </div>

        <div className="route-line"></div>

        <div className="route-point destination">
          <div className="route-indicator">
            <div className="route-dot destination-dot"></div>
          </div>
          <div className="route-content">
            <div className="route-label">Destinazione</div>
            <div className="route-address" onClick={() => handleNavigate(servizio.destinazione.indirizzo)}>
              <span>{servizio.destinazione.indirizzo}</span>
              <span className="route-city">{servizio.destinazione.citta}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Autista */}
      {servizio.autista ? (
        <div className="autista-section">
          <div className="autista-info">
            <Avatar className="autista-avatar">
              <AvatarImage src={servizio.autista.avatar} />
              <AvatarFallback>
                {servizio.autista.nome.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="autista-details">
              <span className="autista-label">Autista</span>
              <span className="autista-nome">{servizio.autista.nome}</span>
            </div>
          </div>
          
          {servizio.autista.telefono && (
            <div className="autista-actions">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCall(servizio.autista.telefono!)}
                className="action-button"
              >
                <Phone className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMessage(servizio.autista.telefono!)}
                className="action-button"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div 
          className={`no-autista-section ${isAdmin && servizio.stato === 'da_assegnare' ? 'clickable' : ''}`}
          onClick={isAdmin && servizio.stato === 'da_assegnare' ? onAssegnaServizio : undefined}
        >
          <User className="w-5 h-5 text-muted-foreground" />
          <span className="no-autista-text">
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