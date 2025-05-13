
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Passeggero } from "@/lib/types/servizi";
import { PasseggeroCard } from "@/components/servizi/passeggeri/PasseggeroCard";

interface ServizioPasseggeriTabProps {
  passeggeri: Passeggero[];
  servizioPresa: string;
  servizioDestinazione: string;
  servizioOrario: string;
}

export function ServizioPasseggeriTab({
  passeggeri,
  servizioPresa,
  servizioDestinazione,
  servizioOrario,
}: ServizioPasseggeriTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista passeggeri</CardTitle>
      </CardHeader>
      <CardContent>
        {passeggeri.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nessun passeggero associato a questo servizio</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {passeggeri.map((passeggero: Passeggero) => (
              <PasseggeroCard
                key={passeggero.id}
                passeggero={passeggero}
                servizioPresa={servizioPresa}
                servizioDestinazione={servizioDestinazione}
                servizioOrario={servizioOrario}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
