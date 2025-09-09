import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, MapPin, Users, Clock, CheckCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Servizio } from '@/lib/types/servizi';
import { Profile } from '@/lib/types';
import { Azienda } from '@/lib/types';

interface MobileServiziListProps {
  servizi: Servizio[];
  users: Profile[];
  aziende: Azienda[];
  passeggeriCounts: Record<string, number>;
  onNavigateToDetail: (id: string) => void;
  onSelect: (servizio: Servizio) => void;
  onCompleta: (servizio: Servizio) => void;
  onFirma: (servizio: Servizio) => void;
  isAdminOrSocio: boolean;
  allServizi: Servizio[];
}

export function MobileServiziList({
  servizi,
  users,
  aziende,
  passeggeriCounts,
  onNavigateToDetail,
  onSelect,
  onCompleta,
  onFirma,
  isAdminOrSocio,
  allServizi
}: MobileServiziListProps) {

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'da_assegnare':
        return <Badge variant="destructive" className="text-xs">Da Assegnare</Badge>;
      case 'assegnato':
        return <Badge variant="secondary" className="text-xs bg-yellow-500 text-white">Assegnato</Badge>;
      case 'completato':
        return <Badge variant="secondary" className="text-xs bg-green-500 text-white">Completato</Badge>;
      case 'annullato':
        return <Badge variant="secondary" className="text-xs bg-gray-500 text-white">Annullato</Badge>;
      case 'non_accettato':
        return <Badge variant="outline" className="text-xs">Non Accettato</Badge>;
      case 'consuntivato':
        return <Badge variant="secondary" className="text-xs bg-blue-500 text-white">Consuntivato</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const getAziendaNome = (aziendaId: string) => {
    const azienda = aziende.find(a => a.id === aziendaId);
    return azienda?.nome || 'N/A';
  };

  const getAssegnatarioNome = (userId: string | null) => {
    if (!userId) return 'Non assegnato';
    const user = users.find(u => u.id === userId);
    return `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email || 'Utente sconosciuto';
  };

  return (
    <div className="space-y-3 py-2">
      {servizi.map((servizio) => (
        <Card 
          key={servizio.id} 
          className="w-full cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigateToDetail(servizio.id)}
        >
          <CardContent className="p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm truncate">
                    {servizio.numero_commessa || `#${servizio.id.slice(0, 8)}`}
                  </span>
                  {getStatusBadge(servizio.stato)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {getAziendaNome(servizio.azienda_id)}
                </p>
              </div>
            </div>

            {/* Data e ora */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              <span>
                {format(new Date(servizio.data_servizio), 'dd MMM yyyy', { locale: it })}
              </span>
              {servizio.orario_servizio && (
                <>
                  <Clock className="h-3 w-3 ml-2" />
                  <span>{servizio.orario_servizio}</span>
                </>
              )}
            </div>

            {/* Indirizzi */}
            <div className="space-y-1">
              <div className="flex items-start gap-2 text-xs">
                <MapPin className="h-3 w-3 mt-0.5 text-green-600 shrink-0" />
                <span className="text-muted-foreground truncate">
                  Da: {servizio.indirizzo_presa}
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <MapPin className="h-3 w-3 mt-0.5 text-red-600 shrink-0" />
                <span className="text-muted-foreground truncate">
                  A: {servizio.indirizzo_destinazione}
                </span>
              </div>
            </div>

            {/* Passeggeri e assegnazione */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3" />
                <span className="text-muted-foreground">
                  {passeggeriCounts[servizio.id] || 0} passeggeri
                </span>
              </div>
              
              {servizio.assegnato_a && (
                <span className="text-muted-foreground text-xs">
                  {getAssegnatarioNome(servizio.assegnato_a)}
                </span>
              )}
            </div>

            {/* Actions */}
            {isAdminOrSocio && (
              <div className="flex gap-2 pt-2 border-t">
                {servizio.stato === 'da_assegnare' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(servizio);
                    }}
                  >
                    Assegna
                  </Button>
                )}
                
                {servizio.stato === 'assegnato' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCompleta(servizio);
                    }}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completa
                  </Button>
                )}
                
                {servizio.stato === 'completato' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFirma(servizio);
                    }}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Firma
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}