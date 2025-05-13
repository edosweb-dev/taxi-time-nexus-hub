
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Servizio, StatoServizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { getAziende } from "@/lib/api/aziende";
import { usePasseggeriCount } from "./card/hooks/usePasseggeriCount";
import {
  ServizioCardHeader,
  ServizioCardCompany,
  ServizioCardDateTime,
  ServizioCardAddresses,
  ServizioCardPayment,
  ServizioCardAssignee,
  ServizioCardActions
} from "./card";

interface ServizioCardProps {
  servizio: Servizio;
  users: Profile[];
  status: StatoServizio;
  isAdminOrSocio: boolean;
  index: number;
  onSelect: (servizio: Servizio) => void;
  onClick: (id: string) => void;
  onCompleta?: (servizio: Servizio) => void;
  onFirma?: (servizio: Servizio) => void;
}

export const ServizioCard = ({
  servizio,
  users,
  status,
  isAdminOrSocio,
  index,
  onSelect,
  onClick,
  onCompleta,
  onFirma
}: ServizioCardProps) => {
  // Fetch all companies for reference
  const { data: aziende = [] } = useQuery({
    queryKey: ['aziende'],
    queryFn: getAziende,
  });
  
  // Get passenger count 
  const passeggeriCount = usePasseggeriCount(servizio.id);

  return (
    <Card 
      className="relative cursor-pointer hover:bg-accent/10 transition-colors"
      onClick={() => onClick(servizio.id)}
    >
      <ServizioCardHeader servizio={servizio} index={index} />
      
      <CardContent>
        <div className="text-sm space-y-3">
          <ServizioCardCompany 
            servizio={servizio} 
            users={users} 
            aziende={aziende} 
          />

          <ServizioCardDateTime servizio={servizio} />

          <ServizioCardAddresses servizio={servizio} />

          <ServizioCardPayment 
            servizio={servizio} 
            passeggeriCount={passeggeriCount} 
          />

          <ServizioCardAssignee 
            servizio={servizio} 
            users={users} 
          />

          <ServizioCardActions
            servizio={servizio}
            status={status}
            isAdminOrSocio={isAdminOrSocio}
            onSelect={onSelect}
            onCompleta={onCompleta}
            onFirma={onFirma}
          />
        </div>
      </CardContent>
    </Card>
  );
};
