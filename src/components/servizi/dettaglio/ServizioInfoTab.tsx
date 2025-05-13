
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { LeftColumn } from "./info/LeftColumn";
import { RightColumn } from "./info/RightColumn";

interface ServizioInfoTabProps {
  servizio: Servizio;
  passeggeri: any[];
  users: Profile[];
  getAziendaName: (aziendaId?: string) => string;
  getUserName: (users: Profile[], userId?: string) => string | null;
  formatCurrency: (value?: number) => string;
}

export function ServizioInfoTab({
  servizio,
  passeggeri,
  users,
  getAziendaName,
  getUserName,
  formatCurrency
}: ServizioInfoTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dettagli del servizio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LeftColumn 
            servizio={servizio}
            passeggeri={passeggeri}
            users={users}
            getAziendaName={getAziendaName}
            getUserName={getUserName}
            formatCurrency={formatCurrency}
          />
          
          <RightColumn servizio={servizio} />
        </div>
      </CardContent>
    </Card>
  );
}
