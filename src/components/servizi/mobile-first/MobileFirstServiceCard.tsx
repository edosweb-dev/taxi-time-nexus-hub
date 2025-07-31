import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Servizio } from '@/lib/types/servizi';
import { Profile } from '@/lib/types';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users,
  Euro,
  ChevronRight,
  UserCheck,
  CheckCircle2,
  FileSignature
} from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface MobileFirstServiceCardProps {
  servizio: Servizio;
  aziendaName: string;
  passeggeriCount: number;
  users: Profile[];
  onNavigateToDetail: (id: string) => void;
  onSelect: (servizio: Servizio) => void;
  onCompleta: (servizio: Servizio) => void;
  onFirma: (servizio: Servizio) => void;
  isAdminOrSocio: boolean;
  allServizi: Servizio[];
}

export function MobileFirstServiceCard({
  servizio,
  aziendaName,
  passeggeriCount,
  users,
  onNavigateToDetail,
  onSelect,
  onCompleta,
  onFirma,
  isAdminOrSocio,
  allServizi
}: MobileFirstServiceCardProps) {

  const getStatusBadge = (stato: string) => {
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

  const getAssignedUser = () => {
    if (!servizio.assegnato_a) return null;
    return users.find(u => u.id === servizio.assegnato_a);
  };

  const assignedUser = getAssignedUser();

  return (
    <Card 
      className="border border-border hover:shadow-md transition-all duration-200 active:scale-[0.98]"
      onClick={() => onNavigateToDetail(servizio.id)}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header with Status and Company */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {getStatusBadge(servizio.stato)}
              {servizio.numero_commessa && (
                <Badge variant="outline" className="text-xs">
                  #{servizio.numero_commessa}
                </Badge>
              )}
            </div>
            <h3 className="font-medium text-sm text-foreground truncate">
              {aziendaName}
            </h3>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
        </div>

        {/* Route Information */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground flex-1 leading-tight">
              {servizio.indirizzo_presa}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground flex-1 leading-tight">
              {servizio.indirizzo_destinazione}
            </p>
          </div>
        </div>

        {/* Service Details Grid */}
        <div className="grid grid-cols-2 gap-3 py-2 border-t border-border">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {format(new Date(servizio.data_servizio), 'dd MMM yyyy', { locale: it })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {servizio.orario_servizio}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {passeggeriCount} passeggeri
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Euro className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              €{servizio.incasso_previsto?.toFixed(2) || '0.00'}
            </span>
          </div>
        </div>

        {/* Assigned User */}
        {assignedUser && (
          <div className="flex items-center gap-2 py-2 bg-muted/30 rounded-lg px-3">
            <UserCheck className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {assignedUser.first_name} {assignedUser.last_name}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        {isAdminOrSocio && (
          <div className="flex gap-2 pt-2 border-t border-border">
            {servizio.stato === 'da_assegnare' && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(servizio);
                }}
              >
                <UserCheck className="h-3 w-3 mr-1" />
                Assegna
              </Button>
            )}
            {servizio.stato === 'assegnato' && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onCompleta(servizio);
                }}
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Completa
              </Button>
            )}
            {servizio.stato === 'completato' && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onFirma(servizio);
                }}
              >
                <FileSignature className="h-3 w-3 mr-1" />
                Firma
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}