import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Servizio, PasseggeroConDettagli } from "@/lib/types/servizi";
import { MapPin, Clock } from "lucide-react";

interface RouteSectionProps {
  servizio: Servizio;
  passeggeri?: PasseggeroConDettagli[];
}

export function RouteSection({ servizio, passeggeri = [] }: RouteSectionProps) {
  // Filtra i passeggeri che hanno indirizzi personalizzati
  const passeggeriConIndirizziIntermedi = passeggeri.filter(p => 
    p.usa_indirizzo_personalizzato && 
    (p.luogo_presa_personalizzato || p.destinazione_personalizzato)
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Percorso</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Partenza */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>Partenza</span>
            </div>
            <div className="text-sm font-medium pl-5">{servizio.indirizzo_presa}</div>
            {servizio.citta_presa && (
              <div className="text-xs text-muted-foreground pl-5">
                {servizio.citta_presa}
              </div>
            )}
          </div>
          
          {/* Tappe intermedie */}
          {passeggeriConIndirizziIntermedi.length > 0 && (
            <div className="pl-2 border-l-2 border-muted space-y-2">
              {passeggeriConIndirizziIntermedi.map((passeggero, index) => (
                <div key={passeggero.id || index} className="space-y-1 pl-3">
                  <div className="text-xs font-medium">
                    {passeggero.nome_cognome}
                  </div>
                  
                  {passeggero.orario_presa_personalizzato && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {passeggero.orario_presa_personalizzato}
                      </span>
                    </div>
                  )}
                  
                  {passeggero.luogo_presa_personalizzato && (
                    <div className="text-xs text-muted-foreground">
                      Presa: {passeggero.luogo_presa_personalizzato}
                    </div>
                  )}
                  
                  {passeggero.destinazione_personalizzato && (
                    <div className="text-xs text-muted-foreground">
                      Dest: {passeggero.destinazione_personalizzato}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Destinazione finale */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>Destinazione</span>
            </div>
            <div className="text-sm font-medium pl-5">{servizio.indirizzo_destinazione}</div>
            {servizio.citta_destinazione && (
              <div className="text-xs text-muted-foreground pl-5">
                {servizio.citta_destinazione}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}