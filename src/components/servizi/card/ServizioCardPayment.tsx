
import { CreditCard, Users, Percent } from "lucide-react";
import { Servizio } from "@/lib/types/servizi";
import { Profile, Azienda } from "@/lib/types";
import { getUserName } from "../utils";
import { Badge } from "@/components/ui/badge";

interface ServizioCardPaymentProps {
  servizio: Servizio;
  passeggeriCount: number;
  users: Profile[];
  azienda?: Azienda;
}

export const ServizioCardPayment = ({ servizio, passeggeriCount, users, azienda }: ServizioCardPaymentProps) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="flex items-start gap-1">
        <CreditCard className="h-4 w-4 mt-0.5 text-muted-foreground" />
        <div>
          <div className="font-medium">Metodo pagamento</div>
          <div className="text-muted-foreground">
            {servizio.metodo_pagamento}
            {servizio.metodo_pagamento === 'Contanti' && users.length > 0 && (() => {
              const consegnatoId = servizio.consegna_contanti_a || null;
              const assegnato = users.find((u) => u.id === servizio.assegnato_a);
              const conducenteIsSocioAdmin = !!assegnato && (assegnato.role === 'admin' || assegnato.role === 'socio');
              const isConducenteEsterno = servizio.conducente_esterno === true;

              if (consegnatoId) {
                return <> → {getUserName(users, consegnatoId) || "Utente sconosciuto"}</>;
              }

              if (conducenteIsSocioAdmin && !isConducenteEsterno && servizio.assegnato_a) {
                return <> → {getUserName(users, servizio.assegnato_a) || "Utente sconosciuto"}</>;
              }

              return (
                <span className="ml-1 text-amber-700 dark:text-amber-400 font-medium">
                  — Incasso non consegnato
                </span>
              );
            })()}
          </div>
        </div>
      </div>
      <div className="flex items-start gap-1">
        <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
        <div>
          <div className="font-medium">Passeggeri</div>
          <div className="text-muted-foreground">{passeggeriCount}</div>
        </div>
      </div>
      
      {/* Indicatore provvigione se l'azienda la supporta */}
      {azienda?.provvigione && (
        <div className="col-span-2 flex items-center gap-2 pt-2 border-t">
          <Percent className="h-3 w-3 text-muted-foreground" />
          <Badge 
            variant={servizio.applica_provvigione ? "default" : "secondary"}
            className={`text-xs ${servizio.applica_provvigione ? "bg-blue-100 text-blue-700" : ""}`}
          >
            Provvigione: {servizio.applica_provvigione ? "Applicata" : "Non applicata"}
          </Badge>
        </div>
      )}
    </div>
  );
};
