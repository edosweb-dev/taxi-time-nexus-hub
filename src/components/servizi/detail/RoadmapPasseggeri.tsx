import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Navigation, Phone, Mail, User } from "lucide-react";

interface PasseggeroRoadmap {
  id?: string;
  nome_cognome: string;
  nome?: string;
  cognome?: string;
  email?: string;
  telefono?: string;
  telefono_2?: string;
  orario_presa?: string;
  luogo_presa?: string;
  localita_presa?: string;
  destinazione?: string;
  localita_destinazione?: string;
  ordine: number;
  usa_indirizzo_personalizzato?: boolean;
  usa_destinazione_personalizzata?: boolean;
}

interface RoadmapPasseggeriProps {
  passeggeri: PasseggeroRoadmap[];
  orarioServizio: string;
  indirizzoPartenza: string;
  cittaPartenza?: string;
  indirizzoDestinazione: string;
  cittaDestinazione?: string;
}

export const RoadmapPasseggeri = ({
  passeggeri,
  orarioServizio,
  indirizzoPartenza,
  cittaPartenza,
  indirizzoDestinazione,
  cittaDestinazione,
}: RoadmapPasseggeriProps) => {
  if (!passeggeri || passeggeri.length === 0) return null;

  // Ordina per ordine di presa, poi per orario
  const passeggeriOrdinati = [...passeggeri].sort((a, b) => {
    // Prima per ordine esplicito
    if (a.ordine !== b.ordine) return a.ordine - b.ordine;
    // Poi per orario se presente
    const orarioA = a.orario_presa || orarioServizio;
    const orarioB = b.orario_presa || orarioServizio;
    return orarioA.localeCompare(orarioB);
  });

  const partenzaDisplay = [indirizzoPartenza, cittaPartenza].filter(Boolean).join(', ');
  const destinazioneDisplay = [indirizzoDestinazione, cittaDestinazione].filter(Boolean).join(', ');

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Navigation className="h-5 w-5 text-primary" />
          Percorso Pick-up
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6">
          {/* Linea verticale timeline */}
          <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-green-500" />

          {/* Punto di partenza - include primo passeggero */}
          <div className="relative pb-6">
            <div className="absolute left-[-22px] w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <MapPin className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <div className="pl-2">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs font-medium">
                  <Clock className="h-3 w-3 mr-1" />
                  {orarioServizio}
                </Badge>
                <span className="text-xs text-muted-foreground font-medium uppercase">Partenza</span>
                {passeggeriOrdinati[0] && (
                  <span className="text-sm font-semibold text-foreground">
                    - {passeggeriOrdinati[0].nome_cognome || `${passeggeriOrdinati[0].nome || ''} ${passeggeriOrdinati[0].cognome || ''}`.trim()}
                  </span>
                )}
              </div>
              {/* Città + Via */}
              <div className="text-sm">
                {cittaPartenza && (
                  <span className="font-semibold text-primary">{cittaPartenza}</span>
                )}
                {cittaPartenza && indirizzoPartenza && <span className="text-muted-foreground"> • </span>}
                {indirizzoPartenza && (
                  <span className="text-muted-foreground">{indirizzoPartenza}</span>
                )}
              </div>
            </div>
          </div>

          {/* Passeggeri */}
          {passeggeriOrdinati.map((passeggero, idx) => {
            // Primo passeggero già mostrato in partenza? Skippiamo
            if (idx === 0) return null;
            
            const nome = passeggero.nome || '';
            const cognome = passeggero.cognome || '';
            const nomeCompleto = `${nome} ${cognome}`.trim() || passeggero.nome_cognome || `Passeggero ${idx + 1}`;
            const orarioPresa = passeggero.orario_presa || orarioServizio;
            
            // Calcola indirizzo con località
            const haPresaPersonalizzata = passeggero.usa_indirizzo_personalizzato && passeggero.luogo_presa;
            const viaFermata = haPresaPersonalizzata ? passeggero.luogo_presa : partenzaDisplay;
            const cittaFermata = haPresaPersonalizzata ? passeggero.localita_presa : cittaPartenza;
            const destinazionePasseggero = passeggero.destinazione || destinazioneDisplay;

            return (
              <div key={passeggero.id || idx} className="relative pb-6">
                <div className="absolute left-[-22px] w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{idx + 1}</span>
                </div>
                <div className="pl-2">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {orarioPresa}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-medium uppercase">Fermata</span>
                    <span className="text-sm font-semibold text-foreground">- {nomeCompleto}</span>
                  </div>
                  
                  {/* Città + Via */}
                  <div className="text-sm">
                    {cittaFermata && (
                      <span className="font-semibold text-primary">{cittaFermata}</span>
                    )}
                    {cittaFermata && viaFermata && <span className="text-muted-foreground"> • </span>}
                    {viaFermata && viaFermata !== partenzaDisplay && (
                      <span className="text-muted-foreground">{viaFermata}</span>
                    )}
                  </div>
                  
                  {/* Destinazione personalizzata */}
                  {passeggero.usa_destinazione_personalizzata && destinazionePasseggero !== destinazioneDisplay && (
                    <div className="flex items-start gap-1.5 text-sm text-amber-600 dark:text-amber-500 mt-1">
                      <Navigation className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                      <span>
                        Dest: {destinazionePasseggero}
                        {passeggero.localita_destinazione && `, ${passeggero.localita_destinazione}`}
                      </span>
                    </div>
                  )}
                  
                  {/* Contatti */}
                  <div className="flex flex-wrap gap-3 mt-2">
                    {passeggero.telefono && (
                      <a 
                        href={`tel:${passeggero.telefono}`}
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Phone className="h-3 w-3" />
                        {passeggero.telefono}
                      </a>
                    )}
                    {passeggero.telefono_2 && (
                      <a 
                        href={`tel:${passeggero.telefono_2}`}
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Phone className="h-3 w-3" />
                        {passeggero.telefono_2}
                      </a>
                    )}
                    {passeggero.email && (
                      <a 
                        href={`mailto:${passeggero.email}`}
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Mail className="h-3 w-3" />
                        {passeggero.email}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}



          {/* Punto di arrivo */}
          <div className="relative">
            <div className="absolute left-[-22px] w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <Navigation className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="pl-2">
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-green-500 hover:bg-green-500 text-white text-xs font-medium">
                  ARRIVO
                </Badge>
              </div>
              <p className="text-sm font-medium">{destinazioneDisplay || 'Non specificato'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
