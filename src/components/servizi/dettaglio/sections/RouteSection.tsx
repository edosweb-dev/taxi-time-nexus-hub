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
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {/* Partenza */}
          <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
            <div className="text-sm font-medium text-muted-foreground mb-2">Partenza</div>
            <div className="text-base leading-relaxed">{servizio.indirizzo_presa}</div>
            {servizio.citta_presa && (
              <div className="text-sm text-muted-foreground mt-1">
                Città: {servizio.citta_presa}
              </div>
            )}
          </div>
          
          {/* Tappe intermedie */}
          {passeggeriConIndirizziIntermedi.map((passeggero, index) => (
            <React.Fragment key={passeggero.id || index}>
              <div className="flex justify-center py-2">
                <div className="w-px h-8 bg-border"></div>
              </div>
              
              <div className="p-4 bg-accent/5 rounded-lg border-l-4 border-accent">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Tappa intermedia - {passeggero.nome_cognome}
                </div>
                
                {/* Indirizzo di presa intermedio */}
                {passeggero.luogo_presa_personalizzato && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Presa intermedia</span>
                      {passeggero.orario_presa_personalizzato && (
                        <div className="flex items-center gap-1 ml-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {passeggero.orario_presa_personalizzato}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-base leading-relaxed ml-6">
                      {passeggero.luogo_presa_personalizzato}
                    </div>
                  </div>
                )}
                
                {/* Destinazione intermedia */}
                {passeggero.destinazione_personalizzato && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Destinazione intermedia</span>
                    </div>
                    <div className="text-base leading-relaxed ml-6">
                      {passeggero.destinazione_personalizzato}
                    </div>
                  </div>
                )}
              </div>
            </React.Fragment>
          ))}
          
          <div className="flex justify-center py-2">
            <div className="w-px h-8 bg-border"></div>
          </div>
          
          {/* Destinazione finale */}
          <div className="p-4 bg-secondary/5 rounded-lg border-l-4 border-secondary">
            <div className="text-sm font-medium text-muted-foreground mb-2">Destinazione finale</div>
            <div className="text-base leading-relaxed">{servizio.indirizzo_destinazione}</div>
            {servizio.citta_destinazione && (
              <div className="text-sm text-muted-foreground mt-1">
                Città: {servizio.citta_destinazione}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}