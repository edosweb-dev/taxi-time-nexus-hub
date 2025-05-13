
import React from "react";
import { Separator } from "@/components/ui/separator";
import { Servizio } from "@/lib/types/servizi";

interface CompletionDataSectionProps {
  servizio: Servizio;
  formatCurrency: (value?: number) => string;
}

export function CompletionDataSection({
  servizio,
  formatCurrency,
}: CompletionDataSectionProps) {
  if (servizio.stato !== 'completato' && servizio.stato !== 'consuntivato') {
    return null;
  }
  
  return (
    <div>
      <h3 className="text-lg font-medium">Dati di completamento</h3>
      <Separator className="my-2" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <div className="font-medium">Incasso ricevuto</div>
          <div className="text-muted-foreground">{formatCurrency(servizio.incasso_ricevuto)}</div>
        </div>
        
        <div>
          <div className="font-medium">Ore lavorate</div>
          <div className="text-muted-foreground">
            {servizio.ore_lavorate !== undefined ? `${servizio.ore_lavorate} ore` : "-"}
          </div>
        </div>
      </div>
    </div>
  );
}
