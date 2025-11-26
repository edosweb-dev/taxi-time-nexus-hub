
import React from "react";
import { CheckCircle2 } from "lucide-react";
import { FirmaServizio } from "@/components/firma/FirmaServizio";
import { Servizio } from "@/lib/types/servizi";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface FirmaDigitaleSectionProps {
  servizio: Servizio;
  firmaDigitaleAttiva: boolean;
  refetch: () => void;
  allPasseggeriSigned?: boolean;
  firmePasseggeri?: number;
  totalPasseggeri?: number;
  passeggeri?: any[];
}

export function FirmaDigitaleSection({ 
  servizio, 
  firmaDigitaleAttiva, 
  refetch,
  allPasseggeriSigned = false,
  firmePasseggeri = 0,
  totalPasseggeri = 0,
  passeggeri = [],
}: FirmaDigitaleSectionProps) {
  const passeggeriConFirma = passeggeri.filter(p => p.firma_url);
  
  return (
    <div className="bg-card border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Firma digitale</h3>
      
      {allPasseggeriSigned ? (
        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400 mb-2">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-sm text-muted-foreground">
              {totalPasseggeri > 1 
                ? `Tutti i passeggeri hanno firmato (${totalPasseggeri}/${totalPasseggeri})`
                : 'Il servizio è già stato firmato'
              }
            </p>
          </div>
          
          {/* Griglia firme multiple passeggeri */}
          {totalPasseggeri > 1 && passeggeriConFirma.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <h4 className="text-sm font-semibold text-muted-foreground">Firme Raccolte</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {passeggeriConFirma.map((passeggero, idx) => (
                  <div key={idx} className="border rounded-lg p-3 bg-muted/30 space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{passeggero.nome_cognome}</p>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 text-xs">
                        ✓ Firmato
                      </Badge>
                    </div>
                    {passeggero.firma_timestamp && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(passeggero.firma_timestamp), "dd/MM/yyyy 'alle' HH:mm")}
                      </p>
                    )}
                    <div className="border rounded p-2 bg-white dark:bg-card">
                      <img 
                        src={passeggero.firma_url} 
                        alt={`Firma ${passeggero.nome_cognome}`}
                        className="w-full h-auto max-h-20 object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
