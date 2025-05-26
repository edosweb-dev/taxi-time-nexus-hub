
import React from "react";
import { CompletaServizioSheet } from "@/components/servizi/completamento";
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
      {/* Completa servizio sheet */}
      <CompletaServizioSheet
        open={completaDialogOpen}
        onOpenChange={onCompletaOpenChange}
        servizioId={servizio.id}
        metodoDefault={servizio.metodo_pagamento}
        onComplete={onComplete}
        users={users}
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
