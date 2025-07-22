
import React from "react";
import { Profile } from "@/lib/types";
import { Servizio } from "@/lib/types/servizi";
import { format, parseISO } from "date-fns";

interface GeneralInfoSectionProps {
  servizio: Servizio;
  passeggeri: any[];
  users: Profile[];
  getAziendaName: (aziendaId?: string) => string;
  getUserName: (users: Profile[], userId?: string) => string | null;
}

export function GeneralInfoSection({
  servizio,
  passeggeri,
  users,
  getAziendaName,
  getUserName,
}: GeneralInfoSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Dettagli del servizio</h3>
        <p className="text-sm text-muted-foreground mb-4">Informazioni principali e contatti</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Cliente</div>
          <div className="text-base text-foreground">{getAziendaName(servizio.azienda_id)}</div>
        </div>
        
        <div className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Referente</div>
          <div className="text-base text-foreground">{getUserName(users, servizio.referente_id) || "Da assegnare"}</div>
        </div>
        
        <div className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Data</div>
          <div className="text-base text-foreground">
            {format(parseISO(servizio.data_servizio), "EEEE, dd MMMM yyyy")}
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Orario</div>
          <div className="text-base text-foreground">{servizio.orario_servizio || "Da definire"}</div>
        </div>
        
        <div className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Pagamento</div>
          <div className="text-base text-foreground">{servizio.metodo_pagamento || "Da definire"}</div>
        </div>
        
        <div className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Passeggeri</div>
          <div className="text-base text-foreground">{passeggeri.length} {passeggeri.length === 1 ? 'passeggero' : 'passeggeri'}</div>
        </div>
      </div>
    </div>
  );
}
