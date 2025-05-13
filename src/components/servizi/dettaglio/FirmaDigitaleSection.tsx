
import React from "react";
import { FirmaServizio } from "@/components/firma/FirmaServizio";
import { Servizio } from "@/lib/types/servizi";

interface FirmaDigitaleSectionProps {
  servizio: Servizio;
  firmaDigitaleAttiva: boolean;
  refetch: () => void;
}

export function FirmaDigitaleSection({ 
  servizio, 
  firmaDigitaleAttiva, 
  refetch 
}: FirmaDigitaleSectionProps) {
  // Only show the firma action button when needed
  if (servizio.stato !== 'assegnato' || servizio.firma_url) {
    return null;
  }

  return (
    <>
      {/* Digital signature action */}
      {firmaDigitaleAttiva && (
        <div className="flex justify-end">
          <FirmaServizio 
            servizioId={servizio.id}
            onFirmaSalvata={refetch}
          />
        </div>
      )}
    </>
  );
}
