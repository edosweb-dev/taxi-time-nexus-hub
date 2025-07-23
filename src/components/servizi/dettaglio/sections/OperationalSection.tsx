import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Servizio } from "@/lib/types/servizi";

interface OperationalSectionProps {
  servizio: Servizio;
  passeggeriCount: number;
}

export function OperationalSection({
  servizio,
  passeggeriCount,
}: OperationalSectionProps) {
  const hasOperationalData = 
    servizio.ore_lavorate !== null || 
    servizio.ore_finali !== null ||
    servizio.ore_effettive !== null ||
    servizio.ore_fatturate !== null ||
    passeggeriCount > 0;

  if (!hasOperationalData) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Dati operativi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-center py-4">
            Nessun dato operativo disponibile
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Dati operativi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Passeggeri</div>
            <div className="text-base font-medium">
              {passeggeriCount} {passeggeriCount === 1 ? 'passeggero' : 'passeggeri'}
            </div>
          </div>
          
          {servizio.ore_lavorate !== null && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Ore lavorate</div>
              <div className="text-base">{servizio.ore_lavorate} ore</div>
            </div>
          )}
          
          {servizio.ore_finali !== null && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Ore finali</div>
              <div className="text-base">{servizio.ore_finali} ore</div>
            </div>
          )}
          
          {servizio.ore_effettive !== null && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Ore effettive</div>
              <div className="text-base">{servizio.ore_effettive} ore</div>
            </div>
          )}
          
          {servizio.ore_fatturate !== null && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Ore fatturate</div>
              <div className="text-base">{servizio.ore_fatturate} ore</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}