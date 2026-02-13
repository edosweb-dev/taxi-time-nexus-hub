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
  isAdmin: boolean;
  getAziendaName: (id?: string) => string;
  getUserName: (users: Profile[], id?: string) => string | null;
  formatCurrency: (value?: number | null) => string;
  firmaDigitaleAttiva: boolean;
  veicoloModello?: string;
  onEdit: () => void;
  onAssegna: () => void;
  onDelete: () => void;
  onCompleta: () => void;
  onConsuntiva: () => void;
  onBack: () => void;
  backLabel?: string;
  onRimuoviAssegnazione?: () => void;
  isRimuoviAssegnazioneLoading?: boolean;
}

export function ServizioDetailDesktop({
  servizio,
  passeggeri,
  users,
  canBeEdited,
  canBeCompleted,
  canBeConsuntivato,
  isAdmin,
  getAziendaName,
  getUserName,
  formatCurrency,
  firmaDigitaleAttiva,
  veicoloModello,
  onEdit,
  onAssegna,
  onDelete,
  onCompleta,
  onConsuntiva,
  onBack,
  backLabel,
  onRimuoviAssegnazione,
  isRimuoviAssegnazioneLoading,
}: ServizioDetailDesktopProps) {
  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <ServizioSidebar
        servizio={servizio}
        canBeEdited={canBeEdited}
        canBeCompleted={canBeCompleted}
        canBeConsuntivato={canBeConsuntivato}
        isAdmin={isAdmin}
        users={users}
        getAziendaName={getAziendaName}
        getUserName={getUserName}
        veicoloModello={veicoloModello}
        onEdit={onEdit}
        onAssegna={onAssegna}
        onDelete={onDelete}
        onCompleta={onCompleta}
        onConsuntiva={onConsuntiva}
        onBack={onBack}
        backLabel={backLabel}
        onRimuoviAssegnazione={onRimuoviAssegnazione}
        isRimuoviAssegnazioneLoading={isRimuoviAssegnazioneLoading}
      />

      {/* Main Content */}
      <main className="flex-1 p-6">
        <ServizioMainContent
          servizio={servizio}
          passeggeri={passeggeri}
          formatCurrency={formatCurrency}
          firmaDigitaleAttiva={firmaDigitaleAttiva}
        />
      </main>
    </div>
  );
}
