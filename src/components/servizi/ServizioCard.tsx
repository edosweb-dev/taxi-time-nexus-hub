
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Servizio, StatoServizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatoBadge, getStateIcon, getUserName } from "./utils/serviceUtils";
import { Users } from "lucide-react";

interface ServizioCardProps {
  servizio: Servizio;
  users: Profile[];
  status: StatoServizio;
  isAdminOrSocio: boolean;
  onSelect: (servizio: Servizio) => void;
  onClick: (id: string) => void;
}

export const ServizioCard = ({
  servizio,
  users,
  status,
  isAdminOrSocio,
  onSelect,
  onClick
}: ServizioCardProps) => {
  return (
    <Card 
      className="relative cursor-pointer hover:bg-accent/10 transition-colors"
      onClick={() => onClick(servizio.id)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {format(new Date(servizio.data_servizio), "EEEE d MMMM yyyy", { locale: it })}
            </span>
          </div>
          {getStatoBadge(servizio.stato)}
        </div>
        <CardTitle className="text-base mt-2">
          {servizio.numero_commessa 
            ? `Commessa: ${servizio.numero_commessa}` 
            : "Servizio di trasporto"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Orario: {servizio.orario_servizio}</p>
          <p>Metodo di pagamento: {servizio.metodo_pagamento}</p>
          {servizio.conducente_esterno ? (
            <p>Conducente esterno: {servizio.conducente_esterno_nome}</p>
          ) : servizio.assegnato_a ? (
            <p>Assegnato a: {getUserName(users, servizio.assegnato_a) || "Utente sconosciuto"}</p>
          ) : status === 'da_assegnare' && isAdminOrSocio ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(servizio);
              }}
            >
              <Users className="mr-2 h-4 w-4" />
              Assegna
            </Button>
          ) : null}
        </div>
      </CardContent>
      {getStateIcon(servizio.stato) && (
        <div className="absolute top-3 right-3">
          {getStateIcon(servizio.stato)}
        </div>
      )}
    </Card>
  );
};
