import React from "react";
import { Servizio, PasseggeroConDettagli } from "@/lib/types/servizi";
import { Profile, Azienda } from "@/lib/types";
import { ServizioSidebar } from "./ServizioSidebar";
import { ServizioMainContent } from "./ServizioMainContent";

interface ServizioDetailDesktopProps {
  servizio: Servizio;
  passeggeri: PasseggeroConDettagli[];
  users: Profile[];
  canBeEdited: boolean;
  canBeCompleted: boolean;
  canBeConsuntivato: boolean;
  canRequestSignature: boolean;
  isAdmin: boolean;
  getAziendaName: (id?: string) => string;
  getAzienda?: (id?: string) => Azienda | undefined;
  getUserName: (users: Profile[], id?: string) => string | null;
  formatCurrency: (value?: number | null) => string;
  firmaDigitaleAttiva: boolean;
  veicoloModello?: string;
  onEdit: () => void;
  onCompleta: () => void;
  onConsuntiva: () => void;
  onRichiestiFirma: () => void;
  onAssegna: () => void;
  onDelete: () => void;
}

export function ServizioDetailDesktop({
  servizio,
  passeggeri,
  users,
  canBeEdited,
  canBeCompleted,
  canBeConsuntivato,
  canRequestSignature,
  isAdmin,
  getAziendaName,
  getAzienda,
  getUserName,
  formatCurrency,
  firmaDigitaleAttiva,
  veicoloModello,
  onEdit,
  onCompleta,
  onConsuntiva,
  onRichiestiFirma,
  onAssegna,
  onDelete,
}: ServizioDetailDesktopProps) {
  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <ServizioSidebar
          servizio={servizio}
          canBeEdited={canBeEdited}
          canBeCompleted={canBeCompleted}
          canBeConsuntivato={canBeConsuntivato}
          canRequestSignature={canRequestSignature}
          isAdmin={isAdmin}
          users={users}
          getAziendaName={getAziendaName}
          getUserName={getUserName}
          veicoloModello={veicoloModello}
          onEdit={onEdit}
          onCompleta={onCompleta}
          onConsuntiva={onConsuntiva}
          onRichiestiFirma={onRichiestiFirma}
          onAssegna={onAssegna}
          onDelete={onDelete}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <ServizioMainContent
          servizio={servizio}
          passeggeri={passeggeri}
          users={users}
          getAziendaName={getAziendaName}
          getAzienda={getAzienda}
          getUserName={getUserName}
          formatCurrency={formatCurrency}
          firmaDigitaleAttiva={firmaDigitaleAttiva}
        />
      </main>
    </div>
  );
}
