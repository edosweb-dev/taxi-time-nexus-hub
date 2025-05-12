import React from "react";
import { Button } from "@/components/ui/button";
import { Profile } from "@/lib/types";
import { Servizio } from "@/lib/types/servizi";
import { getUserName } from "./utils/userUtils";

interface ServizioExpandedRowProps {
  servizio: Servizio;
  users: Profile[];
  onNavigateToDetail: (id: string) => void;
}

export const ServizioExpandedRow: React.FC<ServizioExpandedRowProps> = ({ 
  servizio, 
  users,
  onNavigateToDetail
}) => {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
      <div>
        <span className="font-medium">Referente:</span>{" "}
        <span>{getUserName(users, servizio.referente_id)}</span>
      </div>
      <div>
        <span className="font-medium">Metodo pagamento:</span>{" "}
        <span>{servizio.metodo_pagamento}</span>
      </div>
      <div className="col-span-2">
        <span className="font-medium">Indirizzo di presa:</span>{" "}
        <span>{servizio.indirizzo_presa}</span>
      </div>
      <div className="col-span-2">
        <span className="font-medium">Indirizzo di destinazione:</span>{" "}
        <span>{servizio.indirizzo_destinazione}</span>
      </div>
      {servizio.note && (
        <div className="col-span-2">
          <span className="font-medium">Note:</span>{" "}
          <span>{servizio.note}</span>
        </div>
      )}
      <div className="col-span-2 mt-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onNavigateToDetail(servizio.id);
          }}
        >
          Dettagli completi
        </Button>
      </div>
    </div>
  );
};
