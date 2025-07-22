
import React from "react";
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { LeftColumn } from "./info/LeftColumn";
import { RightColumn } from "./info/RightColumn";
import { FirmaDisplay } from "@/components/firma/FirmaDisplay";

interface ServizioInfoTabProps {
  servizio: Servizio;
  passeggeri: any[];
  users: Profile[];
  getAziendaName: (aziendaId?: string) => string;
  getUserName: (users: Profile[], userId?: string) => string | null;
  formatCurrency: (value?: number) => string;
}

export function ServizioInfoTab({
  servizio,
  passeggeri,
  users,
  getAziendaName,
  getUserName,
  formatCurrency
}: ServizioInfoTabProps) {
  return (
    <div className="space-y-6">
      {/* Main Service Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeftColumn 
          servizio={servizio}
          passeggeri={passeggeri}
          users={users}
          getAziendaName={getAziendaName}
          getUserName={getUserName}
          formatCurrency={formatCurrency}
        />
        
        <RightColumn servizio={servizio} />
      </div>
      
      {/* Digital Signature Section */}
      {servizio.firma_url && (
        <div className="bg-muted/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Firma digitale</h3>
          <FirmaDisplay 
            firmaUrl={servizio.firma_url} 
            firmaTimestamp={servizio.firma_timestamp} 
          />
        </div>
      )}
    </div>
  );
}
