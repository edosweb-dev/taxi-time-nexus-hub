
import React from "react";
import { CompletaServizioOrchestrator } from "@/components/servizi/completamento/CompletaServizioOrchestrator";
import { ConsuntivaServizioSheet } from "@/components/servizi/consuntivazione";
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";

interface ServizioDialogsProps {
  servizio: Servizio;
  completaDialogOpen: boolean;
  consuntivaDialogOpen: boolean;
  onCompletaOpenChange: (open: boolean) => void;
  onConsuntivaOpenChange: (open: boolean) => void;
  onComplete: () => void;
  users: Profile[];
}

export function ServizioDialogs({
  servizio,
  completaDialogOpen,
  consuntivaDialogOpen,
  onCompletaOpenChange,
  onConsuntivaOpenChange,
  onComplete,
  users,
}: ServizioDialogsProps) {
  return (
    <>
      {/* Completa servizio - orchestrator basato su metodo pagamento */}
      <CompletaServizioOrchestrator
        open={completaDialogOpen}
        onOpenChange={onCompletaOpenChange}
        servizio={servizio}
        users={users}
        onComplete={onComplete}
      />

      {/* Consuntiva servizio sheet */}
      <ConsuntivaServizioSheet
        open={consuntivaDialogOpen}
        onOpenChange={onConsuntivaOpenChange}
        servizioId={servizio.id}
        isContanti={servizio.metodo_pagamento === 'Contanti'}
        incassoRicevuto={servizio.incasso_ricevuto}
        oreLavorate={servizio.ore_lavorate}
        users={users}
        onComplete={onComplete}
      />
    </>
  );
}
