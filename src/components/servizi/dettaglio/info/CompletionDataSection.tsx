
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
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Dati di completamento</h3>
        <p className="text-sm text-muted-foreground mb-4">Informazioni inserite al completamento del servizio</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Modalità pagamento</div>
          <div className="text-base text-foreground">{servizio.metodo_pagamento}</div>
        </div>
        
        <div className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Importo incassato</div>
          <div className="text-base text-foreground font-medium">
            {formatCurrency(servizio.incasso_ricevuto)}
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Tempo impiegato</div>
          <div className="text-base text-foreground">
            {servizio.ore_lavorate !== undefined ? `${servizio.ore_lavorate} ore` : "Non specificato"}
          </div>
        </div>
        
        {servizio.metodo_pagamento === 'Contanti' && servizio.consegna_contanti_a && getUserName && (
          <div className="space-y-1">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Consegna contanti</div>
            <div className="text-base text-foreground">
              {getUserName(users, servizio.consegna_contanti_a) || "Operatore non trovato"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
