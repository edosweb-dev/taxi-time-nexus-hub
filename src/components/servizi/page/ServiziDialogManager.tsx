
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { AssegnazioneDialog } from "@/components/servizi/AssegnazioneDialog";
import { CompletaServizioDialog } from "@/components/servizi/CompletaServizioDialog";
import { FirmaServizio } from "@/components/firma/FirmaServizio";

interface ServiziDialogManagerProps {
  users: Profile[];
  onFirmaSalvata: () => void;
  selectedServizio: Servizio | null;
  servizioPerCompletamento: Servizio | null;
  servizioPerFirma: Servizio | null;
  onCloseAssegnazione: () => void;
  onCloseCompletamento: (open: boolean) => void;
}

export function ServiziDialogManager({ 
  users, 
  onFirmaSalvata,
  selectedServizio,
  servizioPerCompletamento,
  servizioPerFirma,
  onCloseAssegnazione,
  onCloseCompletamento
}: ServiziDialogManagerProps) {
  return (
    <>
      {/* Dialog per l'assegnazione */}
      {selectedServizio && (
        <AssegnazioneDialog 
          isOpen={!!selectedServizio} 
          onClose={onCloseAssegnazione} 
          servizio={selectedServizio} 
        />
      )}

      {/* Dialog per il completamento */}
      {servizioPerCompletamento && (
        <CompletaServizioDialog 
          open={!!servizioPerCompletamento} 
          onOpenChange={onCloseCompletamento}
          servizioId={servizioPerCompletamento.id}
          metodoDefault={servizioPerCompletamento.metodo_pagamento}
          onComplete={onFirmaSalvata}
          users={users}
        />
      )}

      {/* Modale per la firma */}
      {servizioPerFirma && (
        <FirmaServizio 
          servizioId={servizioPerFirma.id}
          onFirmaSalvata={onFirmaSalvata}
        />
      )}
    </>
  );
}
