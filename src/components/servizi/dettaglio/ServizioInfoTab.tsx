
import React from "react";
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import {
  BasicInfoSection,
  RouteSection,
  AssignmentInfoSection,
  FinancialSection,
  OperationalSection,
  NotesSignatureSection,
} from "./sections";

interface ServizioInfoTabProps {
  servizio: Servizio;
  passeggeri: any[];
  users: Profile[];
  getAziendaName: (aziendaId?: string) => string;
  getUserName: (users: Profile[], userId?: string) => string | null;
  formatCurrency: (value?: number) => string;
  firmaDigitaleAttiva: boolean;
}

export function ServizioInfoTab({
  servizio,
  passeggeri,
  users,
  getAziendaName,
  getUserName,
  formatCurrency,
  firmaDigitaleAttiva,
}: ServizioInfoTabProps) {
  return (
    <div className="space-y-6">
      {/* Informazioni principali */}
      <BasicInfoSection 
        servizio={servizio}
        users={users}
        getAziendaName={getAziendaName}
        getUserName={getUserName}
      />
      
      {/* Percorso */}
      <RouteSection servizio={servizio} />
      
      {/* Assegnazione */}
      <AssignmentInfoSection 
        servizio={servizio}
        users={users}
        getUserName={getUserName}
      />
      
      {/* Informazioni finanziarie */}
      <FinancialSection 
        servizio={servizio}
        users={users}
        getUserName={getUserName}
        formatCurrency={formatCurrency}
      />
      
      {/* Dati operativi */}
      <OperationalSection 
        servizio={servizio}
        passeggeriCount={passeggeri.length}
      />
      
      {/* Note e firma */}
      <NotesSignatureSection 
        servizio={servizio}
        firmaDigitaleAttiva={firmaDigitaleAttiva}
      />
    </div>
  );
}
