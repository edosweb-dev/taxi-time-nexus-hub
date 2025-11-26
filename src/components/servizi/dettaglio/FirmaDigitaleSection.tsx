
import React from "react";
import { CheckCircle2 } from "lucide-react";
import { FirmaServizio } from "@/components/firma/FirmaServizio";
import { Servizio } from "@/lib/types/servizi";

interface FirmaDigitaleSectionProps {
  servizio: Servizio;
  firmaDigitaleAttiva: boolean;
  refetch: () => void;
  allPasseggeriSigned?: boolean;
  firmePasseggeri?: number;
  totalPasseggeri?: number;
}

export function FirmaDigitaleSection({ 
  servizio, 
  firmaDigitaleAttiva, 
  refetch,
  allPasseggeriSigned = false,
  firmePasseggeri = 0,
  totalPasseggeri = 0,
}: FirmaDigitaleSectionProps) {
  // Always show the card, but with different content based on state
  return (
    <div className="bg-card border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Firma digitale</h3>
      
      {allPasseggeriSigned ? (
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-2">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-sm text-muted-foreground">
            {totalPasseggeri > 1 
              ? `Tutti i passeggeri hanno firmato (${totalPasseggeri}/${totalPasseggeri})`
              : 'Il servizio è già stato firmato'
            }
          </p>
        </div>
      ) : firmaDigitaleAttiva ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {totalPasseggeri > 1 
              ? `${firmePasseggeri} su ${totalPasseggeri} passeggeri hanno firmato`
              : 'Il servizio può essere firmato digitalmente al completamento'
            }
          </p>
          <FirmaServizio 
            servizioId={servizio.id}
            onFirmaSalvata={refetch}
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          La firma digitale non è disponibile per questo servizio
        </p>
      )}
    </div>
  );
}
