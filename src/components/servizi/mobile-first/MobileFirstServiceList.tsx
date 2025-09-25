import { Servizio } from '@/lib/types/servizi';
import { Profile, Azienda } from '@/lib/types';
import { MobileFirstServiceCard } from './MobileFirstServiceCard';

interface MobileFirstServiceListProps {
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

export function MobileFirstServiceList({
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
}: MobileFirstServiceListProps) {
  
  const getAziendaName = (aziendaId: string) => {
    const azienda = aziende.find(a => a.id === aziendaId);
    return azienda?.nome || 'Azienda non trovata';
  };

  if (servizi.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">Nessun servizio trovato</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {servizi.map((servizio) => (
        <MobileFirstServiceCard
          key={servizio.id}
          servizio={servizio}
          aziendaName={getAziendaName(servizio.azienda_id)}
          passeggeriCount={passeggeriCounts[servizio.id] || 0}
          users={users}
          onNavigateToDetail={onNavigateToDetail}
          onSelect={onSelect}
          onCompleta={onCompleta}
          onFirma={onFirma}
          isAdminOrSocio={isAdminOrSocio}
          allServizi={allServizi}
        />
      ))}
    </div>
  );
}