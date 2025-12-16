import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Servizio } from '@/lib/types/servizi';
import { Profile } from '@/lib/types';
import { Clock, MapPin, User, ChevronRight, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ServizioCardProps {
  servizio: Servizio;
  aziendaName: string;
  users: Profile[];
  passengerCount: number;
  index: number;
  isAdminOrSocio: boolean;
  onNavigateToDetail: (id: string) => void;
  onSelect?: (servizio: Servizio) => void;
  onCompleta?: (servizio: Servizio) => void;
  onFirma?: (servizio: Servizio) => void;
}

const statusColors = {
  da_assegnare: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  assegnato: 'bg-blue-100 text-blue-800 border-blue-200',
  completato: 'bg-green-100 text-green-800 border-green-200',
  annullato: 'bg-red-100 text-red-800 border-red-200',
  non_accettato: 'bg-gray-100 text-gray-800 border-gray-200',
  consuntivato: 'bg-purple-100 text-purple-800 border-purple-200',
};

const statusLabels = {
  da_assegnare: 'Da assegnare',
  assegnato: 'Assegnato',
  completato: 'Completato',
  annullato: 'Annullato',
  non_accettato: 'Non accettato',
  consuntivato: 'Consuntivato',
};

export function ServizioCard({
  servizio,
  aziendaName,
  users,
  passengerCount,
  index,
  isAdminOrSocio,
  onNavigateToDetail,
  onSelect,
  onCompleta,
  onFirma
}: ServizioCardProps) {
  const assignedUser = users.find(u => u.id === servizio.assegnato_a);
  const dataServizio = new Date(servizio.data_servizio);
  
  const handleCardClick = () => {
    onNavigateToDetail(servizio.id);
  };

  const getActionButtons = () => {
    const buttons = [];
    
    if (servizio.stato === 'da_assegnare' && isAdminOrSocio && onSelect) {
      buttons.push(
        <Button
          key="assign"
          size="sm" 
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(servizio);
          }}
        >
          Assegna
        </Button>
      );
    }
    
    if (servizio.stato === 'assegnato' && onCompleta) {
      buttons.push(
        <Button
          key="complete"
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onCompleta(servizio);
          }}
        >
          Completa
        </Button>
      );
    }
    
    if (servizio.stato === 'completato' && onFirma) {
      buttons.push(
        <Button
          key="sign"
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onFirma(servizio);
          }}
        >
          Firma
        </Button>
      );
    }
    
    return buttons;
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20 w-full max-w-none"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3 px-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-mono text-muted-foreground">
                {servizio.id_progressivo || `#${index}`}
              </span>
              {servizio.numero_commessa && (
                <Badge variant="outline" className="text-xs">
                  {servizio.numero_commessa}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-sm truncate text-foreground">
              {aziendaName}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <Badge 
                className={cn(
                  "text-xs px-2 py-1",
                  statusColors[servizio.stato as keyof typeof statusColors]
                )}
              >
                {statusLabels[servizio.stato as keyof typeof statusLabels]}
              </Badge>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3 px-3 pb-3">
        {/* Date and Time */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground">
            {format(dataServizio, 'dd MMM yyyy', { locale: it })} • {servizio.orario_servizio?.slice(0, 5) || servizio.orario_servizio}
          </span>
        </div>
        
        {/* Locations */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Da:</p>
              <p className="text-sm font-medium truncate">{servizio.indirizzo_presa}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">A:</p>
              <p className="text-sm font-medium truncate">{servizio.indirizzo_destinazione}</p>
            </div>
          </div>
        </div>
        
        {/* Assigned User and Passengers */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {assignedUser ? `${assignedUser.first_name} ${assignedUser.last_name}` : 'Non assegnato'}
            </span>
          </div>
          {passengerCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {passengerCount} passeggeri
            </Badge>
          )}
        </div>
        
        {/* Action Buttons */}
        {getActionButtons().length > 0 && (
          <div className="flex gap-2 pt-2 border-t">
            {getActionButtons()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}