
import React from "react";
import { Profile } from "@/lib/types";
import { Servizio } from "@/lib/types/servizi";
import { GeneralInfoSection } from "./GeneralInfoSection";
import { AssignmentSection } from "./AssignmentSection";
import { CompletionDataSection } from "./CompletionDataSection";
import { FinalDataSection } from "./FinalDataSection";

interface LeftColumnProps {
  servizio: Servizio;
  passeggeri: any[];
  users: Profile[];
  getAziendaName: (aziendaId?: string) => string;
  getUserName: (users: Profile[], userId?: string) => string | null;
  formatCurrency: (value?: number) => string;
}

export function LeftColumn({
  servizio,
  passeggeri,
  users,
  getAziendaName,
  getUserName,
  formatCurrency,
}: LeftColumnProps) {
  return (
    <div className="space-y-4">
      <GeneralInfoSection 
        servizio={servizio}
        passeggeri={passeggeri}
        users={users}
        getAziendaName={getAziendaName}
        getUserName={getUserName}
      />
      
      <AssignmentSection 
        servizio={servizio}
        users={users}
        getUserName={getUserName}
      />

      <CompletionDataSection 
        servizio={servizio}
        formatCurrency={formatCurrency}
      />

      <FinalDataSection 
        servizio={servizio}
        users={users}
        getUserName={getUserName}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
