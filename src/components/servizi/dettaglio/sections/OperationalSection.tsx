import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car } from "lucide-react";
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
    servizio.ore_sosta !== null ||
    servizio.km_totali !== null ||
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
          
          {/* KM Totali - visibile solo per servizi completati/consuntivati */}
          {(servizio.stato === 'completato' || servizio.stato === 'consuntivato') && 
            servizio.km_totali !== null && servizio.km_totali > 0 && (
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">KM Totali</span>
              </div>
              <span className="font-medium">{servizio.km_totali} km</span>
            </div>
          )}
          
          {servizio.ore_sosta !== null && servizio.ore_sosta > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Ore di sosta</div>
              <div className="text-base">{servizio.ore_sosta}h</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}