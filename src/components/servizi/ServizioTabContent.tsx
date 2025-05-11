
import { Servizio, StatoServizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "./EmptyState";
import { ServizioCard } from "./ServizioCard";

interface ServizioTabContentProps {
  status: StatoServizio;
  servizi: Servizio[];
  users: Profile[];
  isAdminOrSocio: boolean;
  onSelectServizio: (servizio: Servizio) => void;
  onNavigateToDetail: (id: string) => void;
}

export const ServizioTabContent = ({
  status,
  servizi,
  users,
  isAdminOrSocio,
  onSelectServizio,
  onNavigateToDetail
}: ServizioTabContentProps) => {
  const getStatusMessage = (status: StatoServizio) => {
    switch (status) {
      case 'da_assegnare':
        return 'Nessun servizio da assegnare';
      case 'assegnato':
        return 'Nessun servizio assegnato';
      case 'completato':
        return 'Nessun servizio completato';
      case 'non_accettato':
        return 'Nessun servizio non accettato';
      case 'annullato':
        return 'Nessun servizio annullato';
      default:
        return 'Nessun servizio disponibile';
    }
  };

  return (
    <TabsContent key={status} value={status} className="mt-0">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {servizi.length === 0 ? (
          <EmptyState message={getStatusMessage(status)} />
        ) : (
          servizi.map((servizio) => (
            <ServizioCard
              key={servizio.id}
              servizio={servizio}
              users={users}
              status={status}
              isAdminOrSocio={isAdminOrSocio}
              onSelect={onSelectServizio}
              onClick={onNavigateToDetail}
            />
          ))
        )}
      </div>
    </TabsContent>
  );
};
