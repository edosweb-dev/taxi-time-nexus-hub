
import { Passeggero } from "@/lib/types/servizi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PassengerCard } from "./PassengerCard";

interface PassengerListProps {
  passeggeri: Passeggero[];
  defaultIndirizzoPresa: string;
  defaultIndirizzoDestinazione: string;
  defaultOrarioServizio: string;
}

export function PassengerList({ 
  passeggeri, 
  defaultIndirizzoPresa, 
  defaultIndirizzoDestinazione,
  defaultOrarioServizio 
}: PassengerListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Passeggeri ({passeggeri.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {passeggeri.length === 0 ? (
            <div className="col-span-full text-center py-6 text-muted-foreground">
              Nessun passeggero per questo servizio
            </div>
          ) : (
            passeggeri.map((passeggero) => (
              <PassengerCard 
                key={passeggero.id}
                passeggero={passeggero}
                defaultIndirizzoPresa={defaultIndirizzoPresa}
                defaultIndirizzoDestinazione={defaultIndirizzoDestinazione}
                defaultOrarioServizio={defaultOrarioServizio}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
