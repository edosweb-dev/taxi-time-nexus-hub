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
    <div className="container mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* Sidebar - Sticky */}
        <aside className="w-72 shrink-0">
          <div className="sticky top-6">
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
        </aside>

        {/* Main Content - Scrollable */}
        <main className="flex-1 min-w-0">
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
    </div>
  );
}
