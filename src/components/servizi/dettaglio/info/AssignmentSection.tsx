
import React from "react";
import { Separator } from "@/components/ui/separator";
import { Profile } from "@/lib/types";
import { Servizio } from "@/lib/types/servizi";
import { useQuery } from "@tanstack/react-query";
import { getConducenteEsterno } from "@/lib/api/conducenti-esterni";

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
  // Query per caricare il conducente esterno se presente
  const { data: conducenteEsterno } = useQuery({
    queryKey: ['conducente-esterno', servizio.conducente_esterno_id],
    queryFn: () => getConducenteEsterno(servizio.conducente_esterno_id!),
    enabled: !!servizio.conducente_esterno_id,
  });

  return (
    <div>
      <h3 className="text-lg font-medium">Assegnazione</h3>
      <Separator className="my-2" />
      
      <div>
        {servizio.conducente_esterno ? (
          <div className="space-y-2">
            <div>
              <span className="font-medium">Conducente esterno:</span>{" "}
              <span>
                {conducenteEsterno?.nome_cognome || 
                 servizio.conducente_esterno_nome || 
                 "Conducente esterno (non specificato)"}
              </span>
            </div>
            {(conducenteEsterno?.email || servizio.conducente_esterno_email) && (
              <div>
                <span className="font-medium">Email:</span>{" "}
                <span>
                  {conducenteEsterno?.email || servizio.conducente_esterno_email}
                </span>
              </div>
            )}
            {conducenteEsterno?.telefono && (
              <div>
                <span className="font-medium">Telefono:</span>{" "}
                <span>{conducenteEsterno.telefono}</span>
              </div>
            )}
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
