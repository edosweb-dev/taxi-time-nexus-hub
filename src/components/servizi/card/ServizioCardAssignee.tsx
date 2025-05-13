
import { UserRound } from "lucide-react";
import { Profile } from "@/lib/types";
import { Servizio } from "@/lib/types/servizi";
import { getUserName } from "../utils";

interface ServizioCardAssigneeProps {
  servizio: Servizio;
  users: Profile[];
}

export const ServizioCardAssignee = ({ servizio, users }: ServizioCardAssigneeProps) => {
  return (
    <div className="flex items-start gap-1">
      <UserRound className="h-4 w-4 mt-0.5 text-muted-foreground" />
      <div>
        <div className="font-medium">Assegnato a</div>
        {servizio.conducente_esterno ? (
          <div className="text-muted-foreground">
            {servizio.conducente_esterno_nome || "Conducente esterno"}
          </div>
        ) : servizio.assegnato_a ? (
          <div className="text-muted-foreground">
            {getUserName(users, servizio.assegnato_a) || "Utente sconosciuto"}
          </div>
        ) : (
          <div className="text-muted-foreground">Non assegnato</div>
        )}
      </div>
    </div>
  );
};
