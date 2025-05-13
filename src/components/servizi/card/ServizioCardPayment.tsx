
import { CreditCard, Users } from "lucide-react";
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { getUserName } from "../utils";

interface ServizioCardPaymentProps {
  servizio: Servizio;
  passeggeriCount: number;
  users?: Profile[];
}

export const ServizioCardPayment = ({ servizio, passeggeriCount, users = [] }: ServizioCardPaymentProps) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="flex items-start gap-1">
        <CreditCard className="h-4 w-4 mt-0.5 text-muted-foreground" />
        <div>
          <div className="font-medium">Metodo pagamento</div>
          <div className="text-muted-foreground">
            {servizio.metodo_pagamento}
            {servizio.metodo_pagamento === 'Contanti' && servizio.consegna_contanti_a && users.length > 0 && (
              <> → {getUserName(users, servizio.consegna_contanti_a) || "Utente sconosciuto"}</>
            )}
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
    </div>
  );
};
