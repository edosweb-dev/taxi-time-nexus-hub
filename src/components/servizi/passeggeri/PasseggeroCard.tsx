
import { Card, CardContent } from "@/components/ui/card";
import { Passeggero } from "@/lib/types/servizi";
import { MapPin, Clock, Phone, Mail, User } from "lucide-react";

interface PasseggeroCardProps {
  passeggero: Passeggero;
  servizioPresa: string;
  servizioDestinazione: string;
  servizioOrario: string;
}

export const PasseggeroCard = ({
  passeggero,
  servizioPresa,
  servizioDestinazione,
  servizioOrario
}: PasseggeroCardProps) => {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <div className="font-semibold">{passeggero.nome_cognome}</div>
        </div>
        
        {(passeggero.email || passeggero.telefono) && (
          <div className="space-y-1">
            {passeggero.telefono && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">{passeggero.telefono}</div>
              </div>
            )}
            {passeggero.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">{passeggero.email}</div>
              </div>
            )}
          </div>
        )}
        
        <div className="pt-1">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm font-medium">Orario di presa:</div>
            <div className="text-sm">
              {passeggero.orario_presa_personalizzato || servizioOrario}
              {passeggero.orario_presa_personalizzato && (
                <span className="text-xs text-muted-foreground ml-1">(personalizzato)</span>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Luogo di presa:</div>
              <div className="text-sm">
                {passeggero.usa_indirizzo_personalizzato && passeggero.luogo_presa_personalizzato
                  ? passeggero.luogo_presa_personalizzato
                  : servizioPresa}
                {passeggero.usa_indirizzo_personalizzato && passeggero.luogo_presa_personalizzato && (
                  <span className="text-xs text-muted-foreground ml-1">(personalizzato)</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {passeggero.usa_indirizzo_personalizzato && passeggero.destinazione_personalizzato && (
          <div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Destinazione:</div>
                <div className="text-sm">
                  {passeggero.destinazione_personalizzato}
                  <span className="text-xs text-muted-foreground ml-1">(personalizzato)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
