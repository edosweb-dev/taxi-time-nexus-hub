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
      <CardContent className="flex-1">
        <div className={`grid grid-cols-1 gap-4 h-full ${passeggeriConIndirizziIntermedi.length > 0 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
          {/* Partenza */}
          <div className="flex flex-col p-4 bg-primary/5 rounded-lg border-l-4 border-primary min-h-[120px]">
            <div className="text-sm font-medium text-primary mb-2">Partenza</div>
            <div className="text-sm font-medium mb-1">{servizio.indirizzo_presa}</div>
            {servizio.citta_presa && (
              <div className="text-xs text-muted-foreground">
                {servizio.citta_presa}
              </div>
            )}
          </div>
          
          {/* Tappa intermedia */}
          {passeggeriConIndirizziIntermedi.length > 0 && (
            <div className="flex flex-col p-4 bg-accent/5 rounded-lg border-l-4 border-accent min-h-[120px]">
              <div className="text-sm font-medium text-accent-foreground mb-2">Tappa intermedia</div>
              <div className="space-y-2 flex-1">
                {passeggeriConIndirizziIntermedi.map((passeggero, index) => (
                  <div key={passeggero.id || index} className="space-y-1">
                    <div className="text-xs font-medium text-accent-foreground">
                      {passeggero.nome_cognome}
                    </div>
                    
                    {/* Orario di presa */}
                    {passeggero.orario_presa_personalizzato && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {passeggero.orario_presa_personalizzato}
                        </span>
                      </div>
                    )}
                    
                    {/* Indirizzo di presa intermedio */}
                    {passeggero.luogo_presa_personalizzato && (
                      <div className="text-xs">
                        <span className="font-medium">Presa: </span>
                        {passeggero.luogo_presa_personalizzato}
                      </div>
                    )}
                    
                    {/* Destinazione intermedia */}
                    {passeggero.destinazione_personalizzato && (
                      <div className="text-xs">
                        <div className="flex items-center gap-1 mb-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">Destinazione</span>
                        </div>
                        <div className="ml-4 text-xs">
                          {passeggero.destinazione_personalizzato}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Destinazione finale */}
          <div className="flex flex-col p-4 bg-secondary/5 rounded-lg border-l-4 border-secondary min-h-[120px]">
            <div className="text-sm font-medium text-secondary-foreground mb-2">Destinazione finale</div>
            <div className="text-sm font-medium mb-1">{servizio.indirizzo_destinazione}</div>
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