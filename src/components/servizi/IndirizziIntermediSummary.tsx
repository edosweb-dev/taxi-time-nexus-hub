
import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { ServizioFormData } from "@/lib/types/servizi";
import { MapPin, Clock } from "lucide-react";

export function IndirizziIntermediSummary() {
  const { control } = useFormContext<ServizioFormData>();
  
  // Watch passeggeri array and main addresses
  const passeggeri = useWatch({ control, name: "passeggeri" });
  const indirizzoPresa = useWatch({ control, name: "indirizzo_presa" });
  const indirizzoDestinazione = useWatch({ control, name: "indirizzo_destinazione" });
  
  // Filter only passeggeri with custom addresses
  const passeggeriConIndirizziIntermedi = passeggeri?.filter(p => 
    p.usa_indirizzo_personalizzato && 
    (p.luogo_presa_personalizzato || p.destinazione_personalizzato)
  );
  
  // Don't show the summary if there are no intermediate addresses
  if (!passeggeriConIndirizziIntermedi?.length) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <MapPin className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">Nessun indirizzo intermedio</h3>
        <p className="text-muted-foreground">
          Tutti i passeggeri utilizzeranno gli indirizzi principali del servizio
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Riepilogo del percorso</h3>
        <p className="text-muted-foreground text-sm">
          Verifica gli indirizzi personalizzati dei passeggeri
        </p>
      </div>

      <div className="space-y-4">
        {/* Starting Point */}
        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full mt-0.5">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium text-green-900 dark:text-green-100">Partenza</div>
            <div className="text-sm text-green-700 dark:text-green-300">{indirizzoPresa}</div>
          </div>
        </div>

        {/* Intermediate Stops */}
        {passeggeriConIndirizziIntermedi.map((p, idx) => (
          <div key={idx} className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full mt-0.5">
              {idx + 1}
            </div>
            <div className="flex-1 space-y-2">
              <div className="font-medium text-blue-900 dark:text-blue-100">
                Tappa intermedia - {p.nome_cognome}
              </div>
              
              {p.luogo_presa_personalizzato && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-700 dark:text-blue-300">Presa:</span>
                  <span className="text-blue-800 dark:text-blue-200">
                    {p.luogo_presa_personalizzato}
                    {/* ✅ FIX BUG #41: Aggiungi località */}
                    {p.localita_presa_personalizzato && `, ${p.localita_presa_personalizzato}`}
                  </span>
                </div>
              )}
              
              {p.orario_presa_personalizzato && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-700 dark:text-blue-300">Orario:</span>
                  <span className="text-blue-800 dark:text-blue-200">{p.orario_presa_personalizzato}</span>
                </div>
              )}
              
              {p.destinazione_personalizzato && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-700 dark:text-blue-300">Destinazione:</span>
                  <span className="text-blue-800 dark:text-blue-200">
                    {p.destinazione_personalizzato}
                    {/* ✅ FIX BUG #41: Aggiungi località */}
                    {p.localita_destinazione_personalizzato && `, ${p.localita_destinazione_personalizzato}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Final Destination */}
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center justify-center w-8 h-8 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full mt-0.5">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium text-red-900 dark:text-red-100">Destinazione finale</div>
            <div className="text-sm text-red-700 dark:text-red-300">{indirizzoDestinazione}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
