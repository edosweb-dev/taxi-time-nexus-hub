import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Servizio, PasseggeroConDettagli } from "@/lib/types/servizi";
import { MapPin, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RouteSectionProps {
  servizio: Servizio;
  passeggeri?: PasseggeroConDettagli[];
}

export function RouteSection({ servizio, passeggeri = [] }: RouteSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Percorso e Ordine di Presa</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Partenza */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <div className="bg-primary/10 rounded-full p-1.5">
                <MapPin className="h-4 w-4" />
              </div>
              <span>Partenza</span>
            </div>
            <div className="text-sm font-medium pl-9">{servizio.indirizzo_presa}</div>
            {servizio.citta_presa && (
              <div className="text-xs text-muted-foreground pl-9">
                {servizio.citta_presa}
              </div>
            )}
          </div>
          
          {/* Timeline passeggeri */}
          {passeggeri.length > 0 && (
            <div className="relative pl-5 border-l-2 border-primary/30 ml-3 space-y-3">
              {passeggeri.map((passeggero, index) => {
                // Determina orario e luogo presa
                const orarioPresa = passeggero.orario_presa_personalizzato || servizio.orario_servizio;
                const luogoPresa = passeggero.luogo_presa_personalizzato || "Punto di partenza";
                const haPresaPersonalizzata = passeggero.usa_indirizzo_personalizzato && passeggero.luogo_presa_personalizzato;
                
                return (
                  <div key={passeggero.id || index} className="relative">
                    {/* Badge numero progressivo */}
                    <div className="absolute -left-8 top-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {index + 1}
                    </div>
                    
                    <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                      {/* Nome passeggero */}
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{passeggero.nome_cognome}</span>
                        {haPresaPersonalizzata && (
                          <Badge variant="outline" className="text-xs">
                            Presa intermedia
                          </Badge>
                        )}
                      </div>
                      
                      {/* Orario presa */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{orarioPresa}</span>
                      </div>
                      
                      {/* Luogo presa */}
                      <div className="flex items-start gap-2 text-xs">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                        <span className={haPresaPersonalizzata ? "font-medium" : "text-muted-foreground"}>
                          {luogoPresa}
                          {/* ✅ FIX BUG #41: Aggiungi località fermata presa */}
                          {passeggero.localita_presa_personalizzato && `, ${passeggero.localita_presa_personalizzato}`}
                        </span>
                      </div>
                      
                      {/* Destinazione personalizzata se presente */}
                      {passeggero.destinazione_personalizzato && (
                        <div className="flex items-start gap-2 text-xs pt-1 border-t border-border/50">
                          <MapPin className="h-3.5 w-3.5 text-primary mt-0.5" />
                          <div>
                            <span className="text-muted-foreground">Dest: </span>
                            <span className="font-medium">
                              {passeggero.destinazione_personalizzato}
                              {/* ✅ FIX BUG #41: Aggiungi località fermata destinazione */}
                              {passeggero.localita_destinazione_personalizzato && `, ${passeggero.localita_destinazione_personalizzato}`}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Destinazione finale */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <div className="bg-primary/10 rounded-full p-1.5">
                <MapPin className="h-4 w-4" />
              </div>
              <span>Destinazione</span>
            </div>
            <div className="text-sm font-medium pl-9">{servizio.indirizzo_destinazione}</div>
            {servizio.citta_destinazione && (
              <div className="text-xs text-muted-foreground pl-9">
                {servizio.citta_destinazione}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}