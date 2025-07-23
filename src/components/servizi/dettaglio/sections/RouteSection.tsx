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
      <CardHeader>
        <CardTitle className="text-lg">Percorso del servizio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 overflow-x-auto pb-4">
          {/* Partenza */}
          <div className="flex-shrink-0 min-w-[250px]">
            <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary h-full">
              <div className="text-sm font-medium text-muted-foreground mb-2">Partenza</div>
              <div className="text-sm leading-relaxed">{servizio.indirizzo_presa}</div>
              {servizio.citta_presa && (
                <div className="text-xs text-muted-foreground mt-1">
                  {servizio.citta_presa}
                </div>
              )}
            </div>
          </div>
          
          {/* Tappe intermedie */}
          {passeggeriConIndirizziIntermedi.map((passeggero, index) => (
            <React.Fragment key={passeggero.id || index}>
              <div className="flex items-center justify-center px-2">
                <div className="w-8 h-px bg-border"></div>
              </div>
              
              <div className="flex-shrink-0 min-w-[280px]">
                <div className="p-4 bg-accent/5 rounded-lg border-l-4 border-accent h-full">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    {passeggero.nome_cognome}
                  </div>
                  
                  {/* Indirizzo di presa intermedio */}
                  {passeggero.luogo_presa_personalizzato && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium">Presa</span>
                        {passeggero.orario_presa_personalizzato && (
                          <div className="flex items-center gap-1 ml-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {passeggero.orario_presa_personalizzato}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs leading-relaxed ml-5">
                        {passeggero.luogo_presa_personalizzato}
                      </div>
                    </div>
                  )}
                  
                  {/* Destinazione intermedia */}
                  {passeggero.destinazione_personalizzato && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium">Destinazione</span>
                      </div>
                      <div className="text-xs leading-relaxed ml-5">
                        {passeggero.destinazione_personalizzato}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          ))}
          
          <div className="flex items-center justify-center px-2">
            <div className="w-8 h-px bg-border"></div>
          </div>
          
          {/* Destinazione finale */}
          <div className="flex-shrink-0 min-w-[250px]">
            <div className="p-4 bg-secondary/5 rounded-lg border-l-4 border-secondary h-full">
              <div className="text-sm font-medium text-muted-foreground mb-2">Destinazione finale</div>
              <div className="text-sm leading-relaxed">{servizio.indirizzo_destinazione}</div>
              {servizio.citta_destinazione && (
                <div className="text-xs text-muted-foreground mt-1">
                  {servizio.citta_destinazione}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}