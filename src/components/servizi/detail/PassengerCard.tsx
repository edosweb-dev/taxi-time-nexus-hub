
import { Passeggero } from "@/lib/types/servizi";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, Clock, MapPin } from "lucide-react";

interface PassengerCardProps {
  passeggero: Passeggero;
  defaultIndirizzoPresa: string;
  defaultIndirizzoDestinazione: string;
  defaultOrarioServizio: string;
}

export function PassengerCard({ 
  passeggero, 
  defaultIndirizzoPresa,
  defaultIndirizzoDestinazione,
  defaultOrarioServizio
}: PassengerCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex flex-col">
            <span className="font-medium">{passeggero.nome_cognome}</span>
            
            {passeggero.email && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span>{passeggero.email}</span>
              </div>
            )}
            
            {passeggero.telefono && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                <span>{passeggero.telefono}</span>
              </div>
            )}
          </div>
          
          <Separator className="my-2" />
          
          <div className="space-y-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Orario presa</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm">
                  {passeggero.usa_indirizzo_personalizzato && passeggero.orario_presa_personalizzato
                    ? passeggero.orario_presa_personalizzato.substring(0, 5)
                    : defaultOrarioServizio.substring(0, 5)}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Luogo di presa</span>
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm">
                  {passeggero.usa_indirizzo_personalizzato && passeggero.luogo_presa_personalizzato
                    ? passeggero.luogo_presa_personalizzato
                    : defaultIndirizzoPresa}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Destinazione</span>
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm">
                  {passeggero.usa_indirizzo_personalizzato && passeggero.destinazione_personalizzato
                    ? passeggero.destinazione_personalizzato
                    : defaultIndirizzoDestinazione}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
