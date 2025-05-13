
import React from "react";
import { Separator } from "@/components/ui/separator";
import { MapPin } from "lucide-react";
import { Servizio } from "@/lib/types/servizi";

interface AddressSectionProps {
  servizio: Servizio;
}

export function AddressSection({ servizio }: AddressSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-medium">Indirizzi</h3>
      <Separator className="my-2" />
      
      <div className="space-y-3">
        <div className="flex items-start gap-1">
          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div>
            <div className="font-medium">Indirizzo di presa</div>
            <div className="text-muted-foreground">{servizio.indirizzo_presa}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-1">
          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div>
            <div className="font-medium">Indirizzo di destinazione</div>
            <div className="text-muted-foreground">{servizio.indirizzo_destinazione}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
