
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { ServizioCard } from "./ServizioCard";
import { getServizioIndex } from "./utils/formatUtils";

type StatoServizioType = "da_assegnare" | "assegnato" | "non_accettato" | "completato" | "annullato" | "consuntivato";

interface ServizioTabContentProps {
  status: StatoServizioType;
  servizi: Servizio[];
  users: Profile[];
  isAdminOrSocio: boolean;
  onSelectServizio: (servizio: Servizio) => void;
  onNavigateToDetail: (id: string) => void;
  onCompleta?: (servizio: Servizio) => void;
  onFirma?: (servizio: Servizio) => void;
  allServizi?: Servizio[]; // Added for global indexing
}

export const ServizioTabContent = ({
  status,
  servizi,
  users,
  isAdminOrSocio,
  onSelectServizio,
  onNavigateToDetail,
  onCompleta,
  onFirma,
  allServizi
}: ServizioTabContentProps) => {
  if (servizi.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-muted/30">
        Nessun servizio {getLocalizedStatus(status)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {servizi.map((servizio) => {
        // Get index for global progressive ID
        const globalIndex = allServizi 
          ? getServizioIndex(servizio.id, allServizi) 
          : servizi.indexOf(servizio);
          
        return (
          <ServizioCard
            key={servizio.id}
            servizio={servizio}
            users={users}
            isAdminOrSocio={isAdminOrSocio}
            onSelectServizio={onSelectServizio}
            onNavigateToDetail={onNavigateToDetail}
            onCompleta={onCompleta}
            onFirma={onFirma}
            index={globalIndex}
            allServizi={allServizi}
          />
        );
      })}
    </div>
  );
};

function getLocalizedStatus(status: StatoServizioType): string {
  switch (status) {
    case "da_assegnare":
      return "da assegnare";
    case "assegnato":
      return "assegnati";
    case "non_accettato":
      return "non accettati";
    case "completato":
      return "completati";
    case "annullato":
      return "annullati";
    case "consuntivato":
      return "consuntivati";
    default:
      return "";
  }
}
