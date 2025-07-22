
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
      <h3 className="text-lg font-semibold text-foreground mb-1">Percorso</h3>
      <p className="text-sm text-muted-foreground mb-4">Punti di partenza e destinazione</p>
      
      <div className="space-y-3">
        <div className="flex items-start gap-1">
          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div>
            <div className="font-medium text-foreground">📍 Punto di partenza</div>
            <div className="text-sm text-muted-foreground mt-1">{servizio.indirizzo_presa}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-1">
          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div>
            <div className="font-medium text-foreground">🎯 Destinazione</div>
            <div className="text-sm text-muted-foreground mt-1">{servizio.indirizzo_destinazione}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
