import { Servizio } from '@/lib/types/servizi';
import { Profile } from '@/lib/types';
import { ServizioCard } from './ServizioCard';
import { getServizioIndex } from '../utils/formatUtils';

interface ServizioCardListProps {
  servizi: Servizio[];
  users: Profile[];
  aziende: any[];
  passeggeriCounts: Record<string, number>;
  allServizi: Servizio[];
  isAdminOrSocio: boolean;
  onNavigateToDetail: (id: string) => void;
  onSelect?: (servizio: Servizio) => void;
  onCompleta?: (servizio: Servizio) => void;
  onFirma?: (servizio: Servizio) => void;
}

export function ServizioCardList({
  servizi,
  users,
  aziende,
  passeggeriCounts,
  allServizi,
  isAdminOrSocio,
  onNavigateToDetail,
  onSelect,
  onCompleta,
  onFirma
}: ServizioCardListProps) {
  // Get company name by ID
  const getAziendaName = (aziendaId?: string) => {
    if (!aziendaId) return "Azienda sconosciuta";
    const azienda = aziende.find(a => a.id === aziendaId);
    return azienda ? azienda.nome : "Azienda sconosciuta";
  };

  if (servizi.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground text-lg">Nessun servizio disponibile</p>
        <p className="text-muted-foreground text-sm mt-1">
          I servizi che corrispondono ai criteri di ricerca appariranno qui
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full">
      {servizi.map((servizio) => {
        const globalIndex = getServizioIndex(servizio.id, allServizi);
        
        return (
          <ServizioCard
            key={servizio.id}
            servizio={servizio}
            aziendaName={getAziendaName(servizio.azienda_id)}
            users={users}
            passengerCount={passeggeriCounts[servizio.id] || 0}
            index={globalIndex}
            isAdminOrSocio={isAdminOrSocio}
            onNavigateToDetail={onNavigateToDetail}
            onSelect={onSelect}
            onCompleta={onCompleta}
            onFirma={onFirma}
          />
        );
      })}
    </div>
  );
}