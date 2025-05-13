
import { MapPin } from "lucide-react";
import { Servizio } from "@/lib/types/servizi";

interface ServizioCardAddressesProps {
  servizio: Servizio;
}

export const ServizioCardAddresses = ({ servizio }: ServizioCardAddressesProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-1">
        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
        <div>
          <div className="font-medium">Indirizzo di presa</div>
          <div className="text-muted-foreground truncate">{servizio.indirizzo_presa}</div>
        </div>
      </div>
      <div className="flex items-start gap-1">
        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
        <div>
          <div className="font-medium">Indirizzo di destinazione</div>
          <div className="text-muted-foreground truncate">{servizio.indirizzo_destinazione}</div>
        </div>
      </div>
    </div>
  );
};
