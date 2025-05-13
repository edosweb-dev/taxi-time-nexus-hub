
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
    <div>
      <h3 className="text-lg font-medium">Dati di consuntivazione</h3>
      <Separator className="my-2" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <div className="font-medium">Incasso previsto</div>
          <div className="text-muted-foreground">{formatCurrency(servizio.incasso_previsto)}</div>
        </div>
        
        <div>
          <div className="font-medium">Ore finali</div>
          <div className="text-muted-foreground">
            {servizio.ore_finali !== undefined ? `${servizio.ore_finali} ore` : "-"}
          </div>
        </div>
        
        {servizio.metodo_pagamento === 'Contanti' && servizio.consegna_contanti_a && (
          <div>
            <div className="font-medium">Consegna contanti a</div>
            <div className="text-muted-foreground">
              {getUserName(users, servizio.consegna_contanti_a) || "Utente sconosciuto"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
