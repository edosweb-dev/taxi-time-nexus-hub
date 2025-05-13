
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
      <h3 className="text-lg font-medium">Dati generali</h3>
      <Separator className="my-2" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex items-start gap-1">
          <Building className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div>
            <div className="font-medium">Azienda</div>
            <div className="text-muted-foreground">{getAziendaName(servizio.azienda_id)}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-1">
          <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div>
            <div className="font-medium">Referente</div>
            <div className="text-muted-foreground">{getUserName(users, servizio.referente_id)}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-1">
          <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div>
            <div className="font-medium">Data</div>
            <div className="text-muted-foreground">
              {format(parseISO(servizio.data_servizio), "dd/MM/yyyy")}
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-1">
          <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div>
            <div className="font-medium">Orario</div>
            <div className="text-muted-foreground">{servizio.orario_servizio}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-1">
          <CreditCard className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div>
            <div className="font-medium">Metodo pagamento</div>
            <div className="text-muted-foreground">{servizio.metodo_pagamento}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-1">
          <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div>
            <div className="font-medium">Passeggeri</div>
            <div className="text-muted-foreground">{passeggeri.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
