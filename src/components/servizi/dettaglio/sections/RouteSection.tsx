import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Servizio } from "@/lib/types/servizi";

interface RouteSectionProps {
  servizio: Servizio;
}

export function RouteSection({ servizio }: RouteSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Percorso del servizio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
            <div className="text-sm font-medium text-muted-foreground mb-2">Partenza</div>
            <div className="text-base leading-relaxed">{servizio.indirizzo_presa}</div>
            {servizio.citta_presa && (
              <div className="text-sm text-muted-foreground mt-1">
                Città: {servizio.citta_presa}
              </div>
            )}
          </div>
          
          <div className="flex justify-center py-2">
            <div className="w-px h-8 bg-border"></div>
          </div>
          
          <div className="p-4 bg-secondary/5 rounded-lg border-l-4 border-secondary">
            <div className="text-sm font-medium text-muted-foreground mb-2">Destinazione</div>
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