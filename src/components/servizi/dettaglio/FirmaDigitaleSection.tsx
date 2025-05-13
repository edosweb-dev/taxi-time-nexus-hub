
import React from "react";
import { FirmaServizio } from "@/components/firma/FirmaServizio";
import { FirmaDisplay } from "@/components/firma/FirmaDisplay";
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
  // No need to render anything if no firma and not eligible for firma
  if (servizio.stato !== 'assegnato' && !servizio.firma_url) {
    return null;
  }

  return (
    <>
      {/* Digital signature action */}
      {servizio.stato === 'assegnato' && firmaDigitaleAttiva && !servizio.firma_url && (
        <div className="mb-4 flex justify-end">
          <FirmaServizio 
            servizioId={servizio.id}
            onFirmaSalvata={refetch}
          />
        </div>
      )}
      
      {/* Show signature if available */}
      {servizio.firma_url && (
        <div className="mb-6">
          <FirmaDisplay 
            firmaUrl={servizio.firma_url} 
            firmaTimestamp={servizio.firma_timestamp}
          />
        </div>
      )}
    </>
  );
}
