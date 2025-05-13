
import { MapPin, User, Building, CreditCard, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { format } from "date-fns";
import { getUserName } from "./utils";

interface ServizioExpandedRowProps {
  servizio: Servizio;
  users: Profile[];
  onNavigateToDetail: (id: string) => void;
}

export const ServizioExpandedRow = ({
  servizio,
  users,
  onNavigateToDetail
}: ServizioExpandedRowProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">Indirizzo di presa</div>
              <div className="text-muted-foreground">{servizio.indirizzo_presa}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">Indirizzo di destinazione</div>
              <div className="text-muted-foreground">{servizio.indirizzo_destinazione}</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          {servizio.note && (
            <div>
              <div className="font-medium">Note</div>
              <div className="text-muted-foreground">{servizio.note}</div>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">Metodo di pagamento</div>
              <div className="text-muted-foreground">{servizio.metodo_pagamento}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onNavigateToDetail(servizio.id)}
        >
          Visualizza dettagli
        </Button>
      </div>
    </div>
  );
};
