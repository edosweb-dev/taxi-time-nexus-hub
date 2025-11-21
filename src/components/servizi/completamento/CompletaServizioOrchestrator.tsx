import React from "react";
import { getTipoPagamento, TipoPagamento } from "@/lib/types/servizi/metodoPagamentoHelpers";
import { CompletaBonificoDialog } from "./CompletaBonificoDialog";
import { CompletaContantiUberForm } from "./CompletaContantiUberForm";
import { CompletaCartaForm } from "./CompletaCartaForm";
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";

interface CompletaServizioOrchestratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servizio: Servizio;
  users: Profile[];
  onComplete: () => void;
}

/**
 * Orchestrator per completamento servizio
 * Instrada al componente corretto in base al metodo di pagamento:
 * - BONIFICO: Dialog semplice (no campi)
 * - CONTANTI/UBER: Form senza IVA
 * - CARTA: Form con IVA
 */
export function CompletaServizioOrchestrator({
  open,
  onOpenChange,
  servizio,
  users,
  onComplete,
}: CompletaServizioOrchestratorProps) {
  const tipoPagamento = getTipoPagamento(servizio.metodo_pagamento);

  console.log('[CompletaServizioOrchestrator] Routing:', {
    metodo_pagamento: servizio.metodo_pagamento,
    tipo_pagamento: tipoPagamento,
  });

  switch (tipoPagamento) {
    case TipoPagamento.DIRETTO_AZIENDA:
      return (
        <CompletaBonificoDialog
          open={open}
          onOpenChange={onOpenChange}
          servizio={servizio}
          onComplete={onComplete}
        />
      );

    case TipoPagamento.CONTANTI_UBER:
      return (
        <CompletaContantiUberForm
          open={open}
          onOpenChange={onOpenChange}
          servizio={servizio}
          users={users}
          onComplete={onComplete}
        />
      );

    case TipoPagamento.CARTA:
      return (
        <CompletaCartaForm
          open={open}
          onOpenChange={onOpenChange}
          servizio={servizio}
          onComplete={onComplete}
        />
      );

    default:
      return null;
  }
}
