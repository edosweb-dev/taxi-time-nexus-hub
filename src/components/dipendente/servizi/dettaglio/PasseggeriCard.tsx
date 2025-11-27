import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Clock, MapPin, Phone, Mail } from "lucide-react";

interface Passeggero {
  id?: string;
  nome_cognome: string;
  telefono?: string;
  email?: string;
  orario_presa_personalizzato?: string;
  luogo_presa_personalizzato?: string;
  destinazione_personalizzato?: string;
}

interface PasseggeriCardProps {
  passeggeri: Passeggero[];
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
        <div className="text-center py-4 text-sm text-muted-foreground">
          Nessun passeggero
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">👥 PASSEGGERI</h3>
        <Badge variant="secondary" className="text-xs">
          {passeggeri.length}
        </Badge>
      </div>
      
      <div className="space-y-3">
        {passeggeri.map((passeggero, index) => {
          const orarioPresa = passeggero.orario_presa_personalizzato || orarioServizio;
          const luogoPresa = passeggero.luogo_presa_personalizzato || indirizzoPresa;
          const haPresaPersonalizzata = !!passeggero.luogo_presa_personalizzato;
          
          return (
            <div 
              key={passeggero.id || index} 
              className="bg-muted/30 rounded-lg p-3 space-y-2"
            >
              {/* Header con numero e nome */}
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {passeggero.nome_cognome}
                  </div>
                </div>
              </div>
              
              {/* Orario e luogo di presa */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Orario presa:</span>
                  <span className="font-medium">{orarioPresa}</span>
                  {passeggero.orario_presa_personalizzato && (
                    <Badge variant="outline" className="text-[10px]">
                      Personalizzato
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-start gap-2 text-xs">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <span className="text-muted-foreground">Luogo presa: </span>
                    <span className="font-medium">{luogoPresa}</span>
                    {haPresaPersonalizzata && (
                      <Badge variant="outline" className="text-[10px] ml-1">
                        Personalizzato
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Destinazione personalizzata */}
              {passeggero.destinazione_personalizzato && (
                <div className="flex items-start gap-2 text-xs pt-2 border-t border-border/50">
                  <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <span className="text-muted-foreground">Destinazione: </span>
                    <span className="font-medium">{passeggero.destinazione_personalizzato}</span>
                  </div>
                </div>
              )}
              
              {/* Contatti */}
              {(passeggero.telefono || passeggero.email) && (
                <div className="pt-2 border-t border-border/50 space-y-1">
                  {passeggero.telefono && (
                    <div className="flex items-center gap-2 text-xs">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <a 
                        href={`tel:${passeggero.telefono}`}
                        className="text-primary hover:underline"
                      >
                        {passeggero.telefono}
                      </a>
                    </div>
                  )}
                  {passeggero.email && (
                    <div className="flex items-center gap-2 text-xs">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <a 
                        href={`mailto:${passeggero.email}`}
                        className="text-primary hover:underline truncate"
                      >
                        {passeggero.email}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
