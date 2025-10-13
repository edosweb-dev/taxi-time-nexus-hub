import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { PasseggeroDettaglio } from "@/hooks/dipendente/useServizioDettaglio";

interface PasseggeriCardProps {
  passeggeri: PasseggeroDettaglio[];
  orarioServizio: string;
  indirizzoPresa: string;
}

export function PasseggeriCard({ 
  passeggeri, 
  orarioServizio,
  indirizzoPresa 
}: PasseggeriCardProps) {
  if (passeggeri.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">👥 PASSEGGERI</h3>
        <p className="text-sm text-muted-foreground">Nessun passeggero registrato</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">👥 PASSEGGERI</h3>
        <Badge variant="secondary">{passeggeri.length}</Badge>
      </div>
      <div className="space-y-4">
        {passeggeri.map((passeggero, index) => (
          <div key={passeggero.id} className="text-sm border-b last:border-0 pb-4 last:pb-0">
            <p className="font-semibold mb-2">{index + 1}. {passeggero.nome_cognome}</p>
            <div className="space-y-1.5 ml-4">
              {passeggero.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="text-xs">{passeggero.email}</span>
                </div>
              )}
              {passeggero.telefono && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span className="text-xs">{passeggero.telefono}</span>
                </div>
              )}
              {passeggero.orario_presa_personalizzato && (
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs">
                    Orario: <span className="font-medium">{passeggero.orario_presa_personalizzato}</span>
                    {passeggero.orario_presa_personalizzato !== orarioServizio && (
                      <span className="text-muted-foreground ml-1">(personalizzato)</span>
                    )}
                  </span>
                </div>
              )}
              {passeggero.luogo_presa_personalizzato && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                  <div className="text-xs flex-1">
                    <span>Presa: <span className="font-medium">{passeggero.luogo_presa_personalizzato}</span></span>
                    <span className="text-muted-foreground block">(indirizzo personalizzato)</span>
                  </div>
                </div>
              )}
              {!passeggero.luogo_presa_personalizzato && passeggero.indirizzo && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                  <span className="text-xs">
                    Presa: <span className="font-medium">{indirizzoPresa}</span>
                    <span className="text-muted-foreground"> (default)</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
