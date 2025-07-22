
import React from "react";
import { Separator } from "@/components/ui/separator";
import { Building, User, Calendar, Clock, CreditCard, Users } from "lucide-react";
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
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-1">Informazioni generali</h3>
      <p className="text-sm text-muted-foreground mb-4">Dettagli principali del servizio</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex items-start gap-1">
          <Building className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div>
            <div className="font-medium text-foreground">Cliente</div>
            <div className="text-sm text-muted-foreground">{getAziendaName(servizio.azienda_id)}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-1">
          <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div>
            <div className="font-medium text-foreground">Referente cliente</div>
            <div className="text-sm text-muted-foreground">{getUserName(users, servizio.referente_id) || "Non assegnato"}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-1">
          <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div>
            <div className="font-medium text-foreground">Data servizio</div>
            <div className="text-sm text-muted-foreground">
              {format(parseISO(servizio.data_servizio), "dd/MM/yyyy")}
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-1">
          <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div>
            <div className="font-medium text-foreground">Orario previsto</div>
            <div className="text-sm text-muted-foreground">{servizio.orario_servizio || "Non specificato"}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-1">
          <CreditCard className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div>
            <div className="font-medium text-foreground">Modalità di pagamento</div>
            <div className="text-sm text-muted-foreground">{servizio.metodo_pagamento || "Non specificato"}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-1">
          <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div>
            <div className="font-medium text-foreground">Numero passeggeri</div>
            <div className="text-sm text-muted-foreground">{passeggeri.length} {passeggeri.length === 1 ? 'passeggero' : 'passeggeri'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
