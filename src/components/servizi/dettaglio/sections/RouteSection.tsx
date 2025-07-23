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
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Percorso del servizio</CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          {/* Partenza */}
          <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
            <div className="text-sm font-medium text-muted-foreground mb-2">Partenza</div>
            <div className="text-sm leading-relaxed mb-1">{servizio.indirizzo_presa}</div>
            {servizio.citta_presa && (
              <div className="text-xs text-muted-foreground">
                {servizio.citta_presa}
              </div>
            )}
          </div>
          
          {/* Tappa intermedia */}
          {passeggeriConIndirizziIntermedi.length > 0 ? (
            <div className="p-4 bg-accent/5 rounded-lg border-l-4 border-accent">
              <div className="text-sm font-medium text-muted-foreground mb-2">Tappa intermedia</div>
              <div className="space-y-3">
                {passeggeriConIndirizziIntermedi.map((passeggero, index) => (
                  <div key={passeggero.id || index} className="border-b border-border last:border-b-0 pb-3 last:pb-0">
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      {passeggero.nome_cognome}
                    </div>
                    
                    {/* Orario e indirizzo di presa intermedio */}
                    {passeggero.luogo_presa_personalizzato && (
                      <div className="mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {passeggero.orario_presa_personalizzato && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {passeggero.orario_presa_personalizzato}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs leading-relaxed">
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
                        <div className="text-xs leading-relaxed">
                          {passeggero.destinazione_personalizzato}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-muted/10 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl mb-1">🛤️</div>
                <div className="text-xs text-muted-foreground">Nessuna tappa intermedia</div>
              </div>
            </div>
          )}
          
          {/* Destinazione finale */}
          <div className="p-4 bg-secondary/5 rounded-lg border-l-4 border-secondary">
            <div className="text-sm font-medium text-muted-foreground mb-2">Destinazione finale</div>
            <div className="text-sm leading-relaxed mb-1">{servizio.indirizzo_destinazione}</div>
            {servizio.citta_destinazione && (
              <div className="text-xs text-muted-foreground">
                {servizio.citta_destinazione}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}