
import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    return null;
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Riepilogo indirizzi intermedi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Partenza:</span> 
            <span className="font-medium text-foreground">{indirizzoPresa}</span>
          </div>
        </div>

        {passeggeriConIndirizziIntermedi.map((p, idx) => (
          <div key={idx} className="space-y-1 pl-6 border-l-2 border-muted">
            <div className="font-medium">{p.nome_cognome}</div>
            
            {p.luogo_presa_personalizzato && (
              <div className="flex items-center gap-2 ml-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Presa intermedia:</span>
                <span className="text-sm">{p.luogo_presa_personalizzato}</span>
              </div>
            )}
            
            {p.orario_presa_personalizzato && (
              <div className="flex items-center gap-2 ml-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Orario:</span>
                <span className="text-sm">{p.orario_presa_personalizzato}</span>
              </div>
            )}
            
            {p.destinazione_personalizzato && (
              <div className="flex items-center gap-2 ml-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Destinazione intermedia:</span>
                <span className="text-sm">{p.destinazione_personalizzato}</span>
              </div>
            )}
          </div>
        ))}
        
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Destinazione finale:</span>
            <span className="font-medium text-foreground">{indirizzoDestinazione}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
