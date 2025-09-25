import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Servizio } from '@/lib/types/servizi';
import { Profile } from '@/lib/types';
import { 
  Clock, 
  User,
  UserCheck,
  CheckCircle2,
  FileSignature,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptimizedMobileServiceCardProps {
  servizio: Servizio;
  aziendaName: string;
  passeggeriCount: number;
  users: Profile[];
  onNavigateToDetail: (id: string) => void;
  onSelect: (servizio: Servizio) => void;
  onCompleta: (servizio: Servizio) => void;
  onFirma: (servizio: Servizio) => void;
  isAdminOrSocio: boolean;
}

const StatusBadge = ({ stato }: { stato: string }) => {
  const variants = {
    'da_assegnare': { label: 'Da Assegnare', variant: 'destructive' as const },
    'assegnato': { label: 'Assegnato', variant: 'secondary' as const },
    'completato': { label: 'Completato', variant: 'default' as const },
    'annullato': { label: 'Annullato', variant: 'outline' as const },
    'non_accettato': { label: 'Non Accettato', variant: 'outline' as const },
    'consuntivato': { label: 'Consuntivato', variant: 'default' as const },
  };
  
  const config = variants[stato as keyof typeof variants] || variants.da_assegnare;
  return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
};

const ActionButton = ({ servizio, onSelect, onCompleta, onFirma, className }: {
  servizio: Servizio;
  onSelect: (servizio: Servizio) => void;
  onCompleta: (servizio: Servizio) => void;
  onFirma: (servizio: Servizio) => void;
  className?: string;
}) => {
  const handleClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  if (servizio.stato === 'da_assegnare') {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn("text-xs", className)}
        onClick={(e) => handleClick(e, () => onSelect(servizio))}
      >
        <UserCheck className="h-3 w-3 mr-1" />
        Assegna
      </Button>
    );
  }

  if (servizio.stato === 'assegnato') {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn("text-xs", className)}
        onClick={(e) => handleClick(e, () => onCompleta(servizio))}
      >
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Completa
      </Button>
    );
  }

  if (servizio.stato === 'completato') {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn("text-xs", className)}
        onClick={(e) => handleClick(e, () => onFirma(servizio))}
      >
        <FileSignature className="h-3 w-3 mr-1" />
        Firma
      </Button>
    );
  }

  return null;
};

const formatDateTime = (date: string, time?: string) => {
  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('it-IT', { 
    day: '2-digit', 
    month: 'short',
    year: 'numeric'
  });
  return time ? `${formattedDate} - ${time}` : formattedDate;
};

export const OptimizedMobileServiceCard = React.memo(({
  servizio,
  aziendaName,
  passeggeriCount,
  users,
  onNavigateToDetail,
  onSelect,
  onCompleta,
  onFirma,
  isAdminOrSocio
}: OptimizedMobileServiceCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const getAssignedUser = () => {
    if (!servizio.assegnato_a) return null;
    return users.find(u => u.id === servizio.assegnato_a);
  };

  const assignedUser = getAssignedUser();

  return (
    <div 
      className="bg-card rounded-lg shadow-sm border border-border p-4 mb-3 w-full touch-manipulation hover:shadow-md transition-shadow cursor-pointer relative"
      onClick={() => onNavigateToDetail(servizio.id)}
    >
      {/* HEADER COMPATTO */}
      <div className="flex items-center justify-between mb-3">
        <StatusBadge stato={servizio.stato} />
        {servizio.numero_commessa && (
          <span className="text-sm text-muted-foreground font-mono">#{servizio.numero_commessa}</span>
        )}
      </div>
      
      {/* INFO PRIMARIA SEMPRE VISIBILE */}
      <div className="space-y-2 mb-3">
        <h3 className="font-semibold text-lg text-foreground leading-tight">{aziendaName}</h3>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
          <span className="font-medium">{formatDateTime(servizio.data_servizio, servizio.orario_servizio)}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">{passeggeriCount} pax</span>
          <span className="mx-2">•</span>
          <span className="font-semibold text-primary">€{servizio.incasso_previsto?.toFixed(2) || '0.00'}</span>
        </div>
      </div>
      
      {/* DETTAGLI ESPANDIBILI */}
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleContent>
          <div className="space-y-3 py-3 border-t border-border">
            <div className="space-y-2">
              <div className="flex items-start">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-1 mr-3 flex-shrink-0"></div>
                <div className="text-sm text-foreground flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Partenza</div>
                  {servizio.indirizzo_presa}
                  {servizio.citta_presa && (
                    <div className="text-xs text-muted-foreground mt-1">{servizio.citta_presa}</div>
                  )}
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-3 h-3 bg-red-500 rounded-full mt-1 mr-3 flex-shrink-0"></div>
                <div className="text-sm text-foreground flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Destinazione</div>
                  {servizio.indirizzo_destinazione}
                  {servizio.citta_destinazione && (
                    <div className="text-xs text-muted-foreground mt-1">{servizio.citta_destinazione}</div>
                  )}
                </div>
              </div>
            </div>
            {assignedUser && (
              <div className="flex items-center bg-primary/10 rounded-lg p-3">
                <User className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">
                  {assignedUser.first_name} {assignedUser.last_name}
                </span>
              </div>
            )}
            {servizio.conducente_esterno && (
              <div className="flex items-center bg-secondary/10 rounded-lg p-3">
                <User className="w-4 h-4 text-secondary-foreground mr-2 flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">
                  {servizio.conducente_esterno_nome || 'Conducente esterno'}
                </span>
              </div>
            )}
            {servizio.note && (
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">Note:</div>
                <div className="text-sm text-foreground">{servizio.note}</div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
      
      {/* ACTIONS TOUCH-OPTIMIZED */}
      <div className="flex gap-2 mt-4 relative z-10">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="flex-1 py-3 px-4 text-sm font-medium text-muted-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors min-h-[44px] flex items-center justify-center gap-2 touch-manipulation"
        >
          {expanded ? (
            <>
              Nascondi dettagli
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Mostra dettagli
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
        {isAdminOrSocio && (
          <ActionButton 
            servizio={servizio} 
            onSelect={onSelect}
            onCompleta={onCompleta}
            onFirma={onFirma}
            className="flex-1 min-h-[44px]" 
          />
        )}
      </div>
    </div>
  );
});

OptimizedMobileServiceCard.displayName = 'OptimizedMobileServiceCard';