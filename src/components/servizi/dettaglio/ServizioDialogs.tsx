
import React from "react";
import { CompletaServizioDialog } from "@/components/servizi/completamento";
import { ConsuntivaServizioDialog } from "@/components/servizi/ConsuntivaServizioDialog";
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
      {/* Completa servizio dialog */}
      <CompletaServizioDialog
        open={completaDialogOpen}
        onOpenChange={onCompletaOpenChange}
        servizioId={servizio.id}
        metodoDefault={servizio.metodo_pagamento}
        onComplete={onComplete}
        users={users}
      />

      {/* Consuntiva servizio dialog */}
      <ConsuntivaServizioDialog
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
