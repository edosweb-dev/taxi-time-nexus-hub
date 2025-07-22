
import React from "react";
import { Servizio, PasseggeroConDettagli } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { ServizioInfoTab } from "@/components/servizi/dettaglio/ServizioInfoTab";

interface ServizioTabsProps {
  servizio: Servizio;
  passeggeri: PasseggeroConDettagli[];
  users: Profile[];
  activeTab: string; // Keep for compatibility
  onTabChange: (value: string) => void; // Keep for compatibility
  getAziendaName: (aziendaId?: string) => string;
  getUserName: (users: Profile[], userId?: string) => string | null;
  formatCurrency: (value?: number) => string;
}

export function ServizioTabs({
  servizio,
  passeggeri,
  users,
  getAziendaName,
  getUserName,
  formatCurrency,
}: ServizioTabsProps) {
  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <div className="p-6">
        <ServizioInfoTab 
          servizio={servizio}
          passeggeri={passeggeri}
          users={users}
          getAziendaName={getAziendaName}
          getUserName={getUserName}
          formatCurrency={formatCurrency}
        />
      </div>
    </div>
  );
}
