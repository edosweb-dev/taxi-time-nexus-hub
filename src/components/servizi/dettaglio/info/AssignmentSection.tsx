
import React from "react";
import { Separator } from "@/components/ui/separator";
import { Profile } from "@/lib/types";
import { Servizio } from "@/lib/types/servizi";

interface AssignmentSectionProps {
  servizio: Servizio;
  users: Profile[];
  getUserName: (users: Profile[], userId?: string) => string | null;
}

export function AssignmentSection({
  servizio,
  users,
  getUserName,
}: AssignmentSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-medium">Assegnazione</h3>
      <Separator className="my-2" />
      
      <div>
        {servizio.conducente_esterno ? (
          <div className="space-y-2">
            <div>
              <span className="font-medium">Nome conducente esterno:</span>{" "}
              <span>{servizio.conducente_esterno_nome || "Non specificato"}</span>
            </div>
            <div>
              <span className="font-medium">Email conducente esterno:</span>{" "}
              <span>{servizio.conducente_esterno_email || "Non specificato"}</span>
            </div>
          </div>
        ) : servizio.assegnato_a ? (
          <div>
            <span className="font-medium">Assegnato a:</span>{" "}
            <span>{getUserName(users, servizio.assegnato_a) || "Utente sconosciuto"}</span>
          </div>
        ) : (
          <div className="text-muted-foreground">Non assegnato</div>
        )}
      </div>
    </div>
  );
}
