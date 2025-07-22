import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Profile } from "@/lib/types";
import { Servizio } from "@/lib/types/servizi";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";

interface BasicInfoSectionProps {
  servizio: Servizio;
  users: Profile[];
  getAziendaName: (aziendaId?: string) => string;
  getUserName: (users: Profile[], userId?: string) => string | null;
}

export function BasicInfoSection({
  servizio,
  users,
  getAziendaName,
  getUserName,
}: BasicInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Informazioni principali</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Cliente</div>
            <div className="text-base font-medium">{getAziendaName(servizio.azienda_id)}</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Referente</div>
            <div className="text-base">{getUserName(users, servizio.referente_id) || "Da assegnare"}</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Data servizio</div>
            <div className="text-base font-medium">
              {format(parseISO(servizio.data_servizio), "EEEE, dd MMMM yyyy", { locale: it })}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Orario</div>
            <div className="text-base">{servizio.orario_servizio || "Da definire"}</div>
          </div>
          
          {servizio.numero_commessa && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Numero commessa</div>
              <Badge variant="secondary" className="text-sm font-mono">
                {servizio.numero_commessa}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}