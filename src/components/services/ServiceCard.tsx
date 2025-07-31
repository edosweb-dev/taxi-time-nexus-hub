import React from 'react';
import { Servizio } from '@/lib/types/servizi';
import { Profile, Azienda } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, Users, MapPin, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { getStatusBadgeVariant } from '@/components/servizi/utils';

interface ServiceCardProps {
  servizio: Servizio;
  aziende: Azienda[];
  users: Profile[];
  passeggeriCount: number;
  onNavigateToDetail: (id: string) => void;
  onAssign: (servizio: Servizio) => void;
}

export function ServiceCard({ 
  servizio, 
  aziende, 
  users, 
  passeggeriCount,
  onNavigateToDetail,
  onAssign 
}: ServiceCardProps) {
  const azienda = aziende.find(a => a.id === servizio.azienda_id);
  const assignedUser = users.find(u => u.id === servizio.assegnato_a);
  
  const handleCardClick = () => {
    onNavigateToDetail(servizio.id);
  };

  const handleAssignClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAssign(servizio);
  };

  // Generate display ID (formato progressivo)
  const displayId = `#${servizio.id.slice(-6).toUpperCase()}`;

  return (
    <Card 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        {/* Header with ID, Badge and Company */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-medium">{displayId}</span>
              <Badge variant={getStatusBadgeVariant(servizio.stato)}>
                {servizio.stato.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            {servizio.numero_commessa && (
              <p className="text-sm text-muted-foreground">
                Commessa: {servizio.numero_commessa}
              </p>
            )}
            <p className="text-sm font-medium">{azienda?.nome || 'Azienda non trovata'}</p>
          </div>
          {servizio.stato === 'da_assegnare' && (
            <Button 
              size="sm" 
              variant="secondary"
              onClick={handleAssignClick}
            >
              Assegna
            </Button>
          )}
        </div>

        {/* Addresses */}
        <div className="space-y-2 mb-3">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Partenza</p>
              <p className="text-sm truncate">{servizio.indirizzo_presa}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Destinazione</p>
              <p className="text-sm truncate">{servizio.indirizzo_destinazione}</p>
            </div>
          </div>
        </div>

        {/* Service Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Data</p>
              <p className="text-sm font-medium">
                {format(new Date(servizio.data_servizio), 'dd/MM/yyyy', { locale: it })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Orario</p>
              <p className="text-sm font-medium">{servizio.orario_servizio}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Passeggeri</p>
              <p className="text-sm font-medium">{passeggeriCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Assegnato</p>
              <p className="text-sm font-medium">
                {assignedUser 
                  ? `${assignedUser.first_name} ${assignedUser.last_name}`
                  : 'Da assegnare'
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}