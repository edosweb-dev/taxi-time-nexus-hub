
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      {/* Digital signature display */}
      {servizio.firma_url && (
        <div className="md:col-span-2">
          <FirmaDisplay 
            firmaUrl={servizio.firma_url} 
            firmaTimestamp={servizio.firma_timestamp}
          />
        </div>
      )}
      
      {/* Digital signature action */}
      {servizio.stato === 'assegnato' && firmaDigitaleAttiva && !servizio.firma_url && (
        <div className="flex justify-end md:col-span-3">
          <FirmaServizio 
            servizioId={servizio.id}
            onFirmaSalvata={refetch}
          />
        </div>
      )}
    </div>
  );
}
