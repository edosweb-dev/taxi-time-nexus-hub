
import { Servizio, StatoServizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { ServizioCard } from "./ServizioCard";

interface ServizioTabContentProps {
  status: StatoServizio;
  servizi: Servizio[];
  users: Profile[];
  isAdminOrSocio: boolean;
  onSelectServizio: (servizio: Servizio) => void;
  onNavigateToDetail: (id: string) => void;
  onCompleta?: (servizio: Servizio) => void;
  onFirma?: (servizio: Servizio) => void;
}

export const ServizioTabContent = ({
  status,
  servizi,
  users,
  isAdminOrSocio,
  onSelectServizio,
  onNavigateToDetail,
  onCompleta,
  onFirma
}: ServizioTabContentProps) => {
  if (servizi.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nessun servizio {status === "da_assegnare" ? "da assegnare" 
          : status === "assegnato" ? "assegnato" 
          : status === "completato" ? "completato"
          : status === "annullato" ? "annullato"
          : status === "non_accettato" ? "non accettato"
          : ""}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {servizi.map((servizio, index) => (
        <ServizioCard
          key={servizio.id}
          servizio={servizio}
          users={users}
          status={status}
          isAdminOrSocio={isAdminOrSocio}
          index={index}
          onSelect={onSelectServizio}
          onClick={onNavigateToDetail}
          onCompleta={onCompleta}
          onFirma={onFirma}
        />
      ))}
    </div>
  );
};
