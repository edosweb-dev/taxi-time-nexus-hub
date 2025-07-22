
import React from "react";
import { Separator } from "@/components/ui/separator";
import { Profile } from "@/lib/types";
import { Servizio } from "@/lib/types/servizi";

interface FinalDataSectionProps {
  servizio: Servizio;
  users: Profile[];
  getUserName: (users: Profile[], userId?: string) => string | null;
  formatCurrency: (value?: number) => string;
}

export function FinalDataSection({
  servizio,
  users,
  getUserName,
  formatCurrency,
}: FinalDataSectionProps) {
  if (servizio.stato !== 'consuntivato') {
    return null;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Consuntivazione finale</h3>
        <p className="text-sm text-muted-foreground mb-4">Dati definitivi inseriti dopo il completamento</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Ricavo finale</div>
          <div className="text-base text-foreground font-medium">{formatCurrency(servizio.incasso_previsto)}</div>
        </div>
        
        <div className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Durata effettiva</div>
          <div className="text-base text-foreground">
            {servizio.ore_finali !== undefined ? `${servizio.ore_finali} ore` : "Non specificato"}
          </div>
        </div>
        
        {servizio.metodo_pagamento === 'Contanti' && servizio.consegna_contanti_a && (
          <div className="space-y-1">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Responsabile incasso</div>
            <div className="text-base text-foreground">
              {getUserName(users, servizio.consegna_contanti_a) || "Operatore non trovato"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
