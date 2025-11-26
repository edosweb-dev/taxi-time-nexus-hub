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
  // Get company name or private client name
  const getAziendaName = (servizio: Servizio) => {
    // If private client, show client name
    if (servizio.tipo_cliente === 'privato') {
      const nome = servizio.cliente_privato_nome || '';
      const cognome = servizio.cliente_privato_cognome || '';
      return `${nome} ${cognome}`.trim() || "Cliente privato";
    }
    
    // Otherwise, show company name
    if (!servizio.azienda_id) return "Azienda sconosciuta";
    const azienda = aziende.find(a => a.id === servizio.azienda_id);
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
            aziendaName={getAziendaName(servizio)}
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