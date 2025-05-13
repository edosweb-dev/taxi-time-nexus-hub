
import { Card } from "@/components/ui/card";
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { ServizioCardHeader } from "./card/ServizioCardHeader";
import { ServizioCardCompany } from "./card/ServizioCardCompany";
import { ServizioCardAddresses } from "./card/ServizioCardAddresses";
import { ServizioCardAssignee } from "./card/ServizioCardAssignee";
import { ServizioCardActions } from "./card/ServizioCardActions";
import { ServizioCardPayment } from "./card/ServizioCardPayment";
import { usePasseggeriCount } from "./card/hooks/usePasseggeriCount";

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
  const { count } = usePasseggeriCount(servizio.id);

  return (
    <Card className="overflow-hidden">
      <ServizioCardHeader 
        servizio={servizio}
        index={index}
        allServizi={allServizi}
      />
      
      <div className="divide-y">
        <ServizioCardCompany servizio={servizio} />
        
        <ServizioCardAddresses servizio={servizio} />
        
        <ServizioCardAssignee 
          servizio={servizio} 
          users={users} 
          passeggeriCount={count} 
        />
        
        <ServizioCardPayment servizio={servizio} />
        
        <ServizioCardActions 
          servizio={servizio} 
          isAdminOrSocio={isAdminOrSocio}
          onSelect={() => onSelectServizio(servizio)}
          onViewDetails={() => onNavigateToDetail(servizio.id)}
          onCompleta={onCompleta}
          onFirma={onFirma}
        />
      </div>
    </Card>
  );
};
