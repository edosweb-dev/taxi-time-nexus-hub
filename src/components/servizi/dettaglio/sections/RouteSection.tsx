import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Servizio, PasseggeroConDettagli } from "@/lib/types/servizi";
import { MapPin, Clock, User, Navigation, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RouteSectionProps {
  servizio: Servizio;
  passeggeri?: PasseggeroConDettagli[];
}

// Helper: build grouped destination stops
function getDestinazioniRaggruppate(
  passeggeriOrdinati: PasseggeroConDettagli[],
  servizio: Servizio
) {
  const destinazioniMap = new Map<string, { indirizzo: string; citta?: string; passeggeri: string[] }>();

  passeggeriOrdinati.forEach((p) => {
    const haDestPersonalizzata = p.usa_destinazione_personalizzata && p.destinazione_personalizzato;
    const indirizzo = haDestPersonalizzata
      ? p.destinazione_personalizzato!
      : (p.indirizzo || servizio.indirizzo_destinazione);
    const citta = haDestPersonalizzata
      ? (p.localita_destinazione_personalizzato || (p as any).localita_inline || p.localita || servizio.citta_destinazione)
      : (p.localita || servizio.citta_destinazione);
    const key = `${indirizzo}|${citta || ''}`.toLowerCase().trim();

    if (!destinazioniMap.has(key)) {
      destinazioniMap.set(key, { indirizzo: indirizzo || '', citta: citta || undefined, passeggeri: [] });
    }
    destinazioniMap.get(key)!.passeggeri.push(p.nome_cognome || 'Passeggero');
  });

  return Array.from(destinazioniMap.values());
}

export function RouteSection({ servizio, passeggeri = [] }: RouteSectionProps) {
  // Ordina passeggeri per ordine_presa, poi orario
  const passeggeriOrdinati = [...passeggeri].sort((a, b) => {
    const ordineA = (a as any).ordine_presa ?? 0;
    const ordineB = (b as any).ordine_presa ?? 0;
    if (ordineA !== ordineB) return ordineA - ordineB;
    const orarioA = a.orario_presa_personalizzato || servizio.orario_servizio;
    const orarioB = b.orario_presa_personalizzato || servizio.orario_servizio;
    return orarioA.localeCompare(orarioB);
  });

  // Primo passeggero = partenza
  const primoPasseggero = passeggeriOrdinati[0];
  // Passeggeri successivi = fermate intermedie
  const fermateIntermedie = passeggeriOrdinati.slice(1);

  // Destinazioni raggruppate
  const destinazioni = passeggeriOrdinati.length > 0
    ? getDestinazioniRaggruppate(passeggeriOrdinati, servizio)
    : [{ indirizzo: servizio.indirizzo_destinazione, citta: servizio.citta_destinazione || undefined, passeggeri: [] as string[] }];
  const hasMultipleDestinations = destinazioni.length > 1;

  // Calcola indirizzo partenza
  const getIndirizzoPartenza = () => {
    if (primoPasseggero) {
      if (primoPasseggero.usa_indirizzo_personalizzato && primoPasseggero.luogo_presa_personalizzato) {
        const via = primoPasseggero.luogo_presa_personalizzato;
        const citta = primoPasseggero.localita_presa_personalizzato;
        return { via, citta };
      }
    }
    return { via: servizio.indirizzo_presa, citta: servizio.citta_presa };
  };

  const partenza = getIndirizzoPartenza();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Navigation className="h-4 w-4 text-primary" />
          Percorso Pick-up
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6">
          {/* Linea verticale timeline */}
          <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-green-500" />

          {/* PARTENZA - Primo passeggero */}
          <div className="relative pb-5">
            <div className="absolute left-[-22px] w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <MapPin className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <div className="pl-2">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs font-medium">
                  <Clock className="h-3 w-3 mr-1" />
                  {servizio.orario_servizio}
                </Badge>
                <span className="text-xs text-muted-foreground font-medium uppercase">Partenza</span>
                {primoPasseggero && (
                  <span className="text-sm font-semibold text-foreground">
                    - {primoPasseggero.nome_cognome}
                  </span>
                )}
              </div>
              <div className="text-sm">
                {partenza.citta && (
                  <span className="font-semibold text-primary">{partenza.citta}</span>
                )}
                {partenza.citta && partenza.via && <span className="text-muted-foreground"> • </span>}
                {partenza.via && (
                  <span className="text-muted-foreground">{partenza.via}</span>
                )}
              </div>
            </div>
          </div>

          {/* FERMATE INTERMEDIE PRESA - Passeggeri dal 2° in poi */}
          {fermateIntermedie.map((passeggero, index) => {
            const orarioPresa = passeggero.orario_presa_personalizzato || servizio.orario_servizio;
            const haPresaPersonalizzata = passeggero.usa_indirizzo_personalizzato && passeggero.luogo_presa_personalizzato;
            
            const viaFermata = haPresaPersonalizzata 
              ? passeggero.luogo_presa_personalizzato 
              : (passeggero.indirizzo || servizio.indirizzo_presa);
            
            const cittaFermata = haPresaPersonalizzata
              ? (passeggero.localita_presa_personalizzato || 
                 (passeggero as any).localita_inline || 
                 passeggero.localita || 
                 servizio.citta_presa)
              : (passeggero.localita || servizio.citta_presa);

            return (
              <div key={passeggero.id || index} className="relative pb-5">
                <div className="absolute left-[-22px] w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{index + 2}</span>
                </div>
                
                <div className="pl-2">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {orarioPresa}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-medium uppercase">Fermata</span>
                    <span className="text-sm font-semibold text-foreground">
                      - {passeggero.nome_cognome}
                    </span>
                  </div>
                  
                  <div className="text-sm">
                    {cittaFermata && (
                      <span className="font-semibold text-primary">{cittaFermata}</span>
                    )}
                    {cittaFermata && viaFermata && <span className="text-muted-foreground"> • </span>}
                    {viaFermata && (
                      <span className="text-muted-foreground">{viaFermata}</span>
                    )}
                  </div>
                  
                  {passeggero.usa_destinazione_personalizzata && passeggero.destinazione_personalizzato && (
                    <div className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-500 mt-1.5">
                      <Navigation className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                      <span>
                        Dest: {passeggero.localita_destinazione_personalizzato || (passeggero as any).localita_inline || passeggero.localita || servizio.citta_destinazione}
                        {passeggero.destinazione_personalizzato && ` • ${passeggero.destinazione_personalizzato}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* DESTINAZIONI - Tappe intermedie + Arrivo finale */}
          {destinazioni.map((dest, index) => {
            const isLast = index === destinazioni.length - 1;
            return (
              <div key={`dest-${index}`} className={isLast ? "relative" : "relative pb-5"}>
                <div className={`absolute left-[-22px] w-6 h-6 rounded-full flex items-center justify-center ${
                  isLast ? 'bg-green-500' : 'bg-blue-500'
                }`}>
                  {isLast ? (
                    <Flag className="h-3.5 w-3.5 text-white" />
                  ) : (
                    <Navigation className="h-3.5 w-3.5 text-white" />
                  )}
                </div>
                <div className="pl-2">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge className={`text-xs font-medium ${
                      isLast 
                        ? 'bg-green-500 hover:bg-green-500 text-white' 
                        : 'bg-blue-500 hover:bg-blue-500 text-white'
                    }`}>
                      {isLast ? 'ARRIVO' : `TAPPA ${index + 1}`}
                    </Badge>
                    {dest.passeggeri.length > 0 && (
                      <span className="text-sm text-muted-foreground">
                        {dest.passeggeri.join(', ')}
                      </span>
                    )}
                  </div>
                  <div className="text-sm">
                    {dest.citta && (
                      <span className="font-semibold text-primary">{dest.citta}</span>
                    )}
                    {dest.citta && dest.indirizzo && <span className="text-muted-foreground"> • </span>}
                    {dest.indirizzo && (
                      <span className="text-muted-foreground">{dest.indirizzo}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
