
import { Building, User } from "lucide-react";
import { Profile } from "@/lib/types";
import { Servizio } from "@/lib/types/servizi";
import { getUserName } from "../utils";
import { Azienda } from "@/lib/types";

interface ServizioCardCompanyProps {
  servizio: Servizio;
  users: Profile[];
  aziende: Azienda[];
}

export const ServizioCardCompany = ({ servizio, users, aziende }: ServizioCardCompanyProps) => {
  // Get company name by ID
  const getAziendaName = (aziendaId?: string) => {
    if (!aziendaId) return "Azienda sconosciuta";
    const azienda = aziende.find(a => a.id === aziendaId);
    return azienda ? azienda.nome : "Azienda sconosciuta";
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="flex items-start gap-1">
        <Building className="h-4 w-4 mt-0.5 text-muted-foreground" />
        <div>
          <div className="font-medium">Azienda</div>
          <div className="text-muted-foreground">{getAziendaName(servizio.azienda_id)}</div>
        </div>
      </div>
      <div className="flex items-start gap-1">
        <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
        <div>
          <div className="font-medium">Referente</div>
          <div className="text-muted-foreground">{getUserName(users, servizio.referente_id)}</div>
        </div>
      </div>
    </div>
  );
};
