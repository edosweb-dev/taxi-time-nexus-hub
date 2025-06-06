
import React from "react";
import { Separator } from "@/components/ui/separator";
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";

interface CompletionDataSectionProps {
  servizio: Servizio;
  users?: Profile[];
  getUserName?: (users: Profile[], userId?: string) => string | null;
  formatCurrency: (value?: number) => string;
}

export function CompletionDataSection({
  servizio,
  users = [],
  getUserName,
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
          <div className="font-medium">Metodo pagamento</div>
          <div className="text-muted-foreground">{servizio.metodo_pagamento}</div>
        </div>
        
        <div>
          <div className="font-medium">Incasso ricevuto</div>
          <div className="text-muted-foreground">
            {formatCurrency(servizio.incasso_ricevuto)}
          </div>
        </div>
        
        <div>
          <div className="font-medium">Ore lavorate</div>
          <div className="text-muted-foreground">
            {servizio.ore_lavorate !== undefined ? `${servizio.ore_lavorate} ore` : "-"}
          </div>
        </div>
        
        {/* Display cash recipient information */}
        {servizio.metodo_pagamento === 'Contanti' && servizio.consegna_contanti_a && getUserName && (
          <div>
            <div className="font-medium">Contanti consegnati a</div>
            <div className="text-muted-foreground">
              {getUserName(users, servizio.consegna_contanti_a) || "Utente sconosciuto"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
