
import { Card } from "@/components/ui/card";
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { Azienda } from "@/lib/types";
import { ServizioCardHeader } from "./card/ServizioCardHeader";
import { ServizioCardCompany } from "./card/ServizioCardCompany";
import { ServizioCardAddresses } from "./card/ServizioCardAddresses";
import { ServizioCardAssignee } from "./card/ServizioCardAssignee";
import { ServizioCardActions } from "./card/ServizioCardActions";
import { ServizioCardPayment } from "./card/ServizioCardPayment";
import { usePasseggeriCount } from "./card/hooks/usePasseggeriCount";
import { useAziende } from "@/hooks/useAziende";

interface ServizioCardProps {
  servizio: Servizio;
  users: Profile[];
  isAdminOrSocio: boolean;
  onSelectServizio: (servizio: Servizio) => void;
  onNavigateToDetail: (id: string) => void;
  onCompleta?: (servizio: Servizio) => void;
  onFirma?: (servizio: Servizio) => void;
  index: number;
  allServizi?: { id: string }[]; // Added for global indexing
}

export const ServizioCard = ({
  servizio,
  users,
  isAdminOrSocio,
  onSelectServizio,
  onNavigateToDetail,
  onCompleta,
  onFirma,
  index,
  allServizi
}: ServizioCardProps) => {
  const { data: passeggeriCount } = usePasseggeriCount(servizio.id);
  const { aziende } = useAziende();

  return (
    <Card className="overflow-hidden">
      <ServizioCardHeader 
        servizio={servizio}
        index={index}
        allServizi={allServizi}
      />
      
      <div className="divide-y">
        <ServizioCardCompany 
          servizio={servizio} 
          users={users}
          aziende={aziende}
        />
        
        <ServizioCardAddresses servizio={servizio} />
        
        <ServizioCardAssignee 
          servizio={servizio} 
          users={users}
        />
        
        <ServizioCardPayment 
          servizio={servizio} 
          passeggeriCount={passeggeriCount || 0} 
          users={users}
          azienda={aziende?.find(a => a.id === servizio.azienda_id)}
        />
        
        <ServizioCardActions 
          servizio={servizio} 
          status={servizio.stato}
          isAdminOrSocio={isAdminOrSocio}
          onSelect={() => onSelectServizio(servizio)}
          onCompleta={onCompleta}
          onFirma={onFirma}
        />
      </div>
    </Card>
  );
};
