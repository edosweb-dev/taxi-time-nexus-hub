
import React from "react";
import { Servizio } from "@/lib/types/servizi";

interface AddressSectionProps {
  servizio: Servizio;
}

export function AddressSection({ servizio }: AddressSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Percorso del servizio</h3>
        <p className="text-sm text-muted-foreground mb-4">Itinerario completo dalla partenza alla destinazione</p>
      </div>
      
      <div className="space-y-6">
        <div className="p-4 bg-muted/30 rounded-lg border-l-4 border-primary">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Partenza</div>
          <div className="text-base text-foreground leading-relaxed">{servizio.indirizzo_presa}</div>
        </div>
        
        <div className="flex justify-center">
          <div className="w-px h-8 bg-border"></div>
        </div>
        
        <div className="p-4 bg-muted/30 rounded-lg border-l-4 border-secondary">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Destinazione</div>
          <div className="text-base text-foreground leading-relaxed">{servizio.indirizzo_destinazione}</div>
        </div>
      </div>
    </div>
  );
}
