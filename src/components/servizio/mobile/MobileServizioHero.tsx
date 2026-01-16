import React, { useState } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Phone, MessageCircle, Navigation, Clock, User, MapPin, ArrowRight } from 'lucide-react';
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
  passeggeri?: Array<{
    nome_cognome: string;
    usa_indirizzo_personalizzato?: boolean;
    luogo_presa_personalizzato?: string;
    localita_presa_personalizzato?: string;
    orario_presa_personalizzato?: string;
  }>;
  isAdmin?: boolean;
  onAssegnaServizio?: () => void;
}

export function MobileServizioHero({ servizio, passeggeri = [], isAdmin = false, onAssegnaServizio }: MobileServizioHeroProps) {
  
  // Get the badge properties for styling
  const getBadgeConfig = () => {
    switch (servizio.stato) {
      case 'da_assegnare':
        return { variant: 'destructive' as const, label: 'Da Assegnare' };
      case 'assegnato':
        return { variant: 'secondary' as const, label: 'Assegnato' };
      case 'completato':
        return { variant: 'outline' as const, label: 'Completato' };
      case 'consuntivato':
        return { variant: 'default' as const, label: 'Consuntivato' };
      case 'annullato':
        return { variant: 'destructive' as const, label: 'Annullato' };
      case 'non_accettato':
        return { variant: 'destructive' as const, label: 'Non Accettato' };
      default:
        return { variant: 'secondary' as const, label: servizio.stato };
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
    <div className="bg-card border border-border rounded-xl mt-5 overflow-hidden shadow-sm transition-all duration-300">
      {/* Compact Header - Always Visible */}
      <div className="p-4 space-y-3">
        {/* Status + Cliente */}
        <div className="flex items-center justify-between gap-2">
          <Badge variant={badgeConfig.variant} className="text-xs font-semibold px-2 py-1">
            {badgeConfig.label}
          </Badge>
          <h2 className="font-semibold text-base truncate flex-1 text-center">
            {servizio.cliente.nome}
          </h2>
        </div>

        {/* Timing Compatto */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-primary/5 rounded-lg p-2">
          <Clock className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="font-semibold text-primary">{servizio.orario}</span>
          <span>Ritiro</span>
          <span>•</span>
          <span className="font-medium">{servizio.pickup.citta}</span>
        </div>

        {/* Percorso Completo - Sempre Visibile */}
        <div className="bg-muted/30 rounded-lg p-3 space-y-3">
          {/* Pickup */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-chart-1 border-2 border-background shadow-sm" />
              <div className="w-0.5 flex-1 bg-border min-h-[40px]" />
            </div>
            <div className="flex-1 pb-2">
              <div className="text-xs text-muted-foreground font-medium mb-1">Ritiro</div>
              <div 
                className="text-sm font-medium cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleNavigate(servizio.pickup.indirizzo)}
              >
                {servizio.pickup.indirizzo}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{servizio.pickup.citta}</div>
            </div>
          </div>

          {/* Fermate intermedie - se presenti */}
          {passeggeri.filter(p => p.usa_indirizzo_personalizzato && p.luogo_presa_personalizzato).map((passeggero, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground border-2 border-background shadow-sm" />
                <div className="w-0.5 flex-1 bg-border min-h-[40px]" />
              </div>
              <div className="flex-1 pb-2">
                <div className="text-xs text-muted-foreground font-medium mb-1">
                  Fermata - {passeggero.nome_cognome}
                </div>
                <div 
                  className="text-sm font-medium cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleNavigate(passeggero.luogo_presa_personalizzato!)}
                >
                  {passeggero.luogo_presa_personalizzato}
                  {/* ✅ FIX BUG #41: Aggiungi località */}
                  {passeggero.localita_presa_personalizzato && `, ${passeggero.localita_presa_personalizzato}`}
                </div>
                {passeggero.orario_presa_personalizzato && (
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {passeggero.orario_presa_personalizzato.substring(0, 5)}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Destinazione */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-destructive border-2 border-background shadow-sm" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-muted-foreground font-medium mb-1">Destinazione</div>
              <div 
                className="text-sm font-medium cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleNavigate(servizio.destinazione.indirizzo)}
              >
                {servizio.destinazione.indirizzo}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{servizio.destinazione.citta}</div>
            </div>
          </div>

          {/* Durata e Distanza */}
          {(servizio.durata || servizio.distanza) && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
              {servizio.durata && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{servizio.durata}</span>
                </div>
              )}
              {servizio.distanza && (
                <div className="flex items-center gap-1">
                  <ArrowRight className="h-3 w-3" />
                  <span>{servizio.distanza}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Autista Compatto (se assegnato) */}
        {servizio.autista ? (
          <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={servizio.autista.avatar} />
              <AvatarFallback className="text-xs">
                {servizio.autista.nome.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground">Autista</div>
              <div className="font-medium text-sm truncate">{servizio.autista.nome}</div>
            </div>
          </div>
        ) : isAdmin && servizio.stato === 'da_assegnare' ? (
          <button
            onClick={onAssegnaServizio}
            className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg p-3 transition-colors"
          >
            <User className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Tocca per assegnare</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-destructive/10 rounded-lg p-2 text-destructive">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">Nessun autista assegnato</span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center gap-2 pt-2 border-t">
          {servizio.cliente.telefono && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCall(servizio.cliente.telefono!)}
                className="flex-1 min-h-[40px]"
              >
                <Phone className="h-4 w-4 mr-1" />
                <span className="text-xs">Cliente</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleMessage(servizio.cliente.telefono!)}
                className="flex-1 min-h-[40px]"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                <span className="text-xs">SMS</span>
              </Button>
            </>
          )}
          
          {servizio.autista?.telefono && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCall(servizio.autista.telefono!)}
              className="flex-1 min-h-[40px]"
            >
              <Phone className="h-4 w-4 mr-1" />
              <span className="text-xs">Autista</span>
            </Button>
          )}
        </div>
      </div>

    </div>
  );
}