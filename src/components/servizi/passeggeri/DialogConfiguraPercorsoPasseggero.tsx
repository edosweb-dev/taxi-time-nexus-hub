import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Home, Car, Pencil, ArrowLeft, ArrowRight, Check, MapPin, Navigation, Clock } from "lucide-react";
import { PasseggeroClienteData } from "./PasseggeroClienteCard";

export interface PercorsoConfig {
  presaTipo: 'servizio' | 'passeggero' | 'personalizzato';
  destinazioneTipo: 'servizio' | 'personalizzato';
  luogoPresa: string | null;
  localitaPresa: string | null;
  destinazione: string | null;
  localitaDestinazione: string | null;
  orarioPresaPersonalizzato: string | null;
  usaOrarioServizio: boolean;
}

interface DatiServizio {
  indirizzoPresaServizio: string;
  cittaPresaServizio: string;
  indirizzoDestinazioneServizio: string;
  cittaDestinazioneServizio: string;
  orarioServizio: string;
}

interface DialogConfiguraPercorsoPasseggeroProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  passeggero: PasseggeroClienteData;
  datiServizio: DatiServizio;
  onConfirm: (config: PercorsoConfig) => void;
}

type Modalita = 'scelta' | 'personalizza';

export const DialogConfiguraPercorsoPasseggero = ({
  open,
  onOpenChange,
  passeggero,
  datiServizio,
  onConfirm,
}: DialogConfiguraPercorsoPasseggeroProps) => {
  const hasIndirizzo = !!(passeggero.indirizzo || passeggero.localita);
  const [modalita, setModalita] = useState<Modalita>(hasIndirizzo ? 'scelta' : 'personalizza');

  // Form state for personalizza mode
  const [usaPresaServizio, setUsaPresaServizio] = useState(true);
  const [presaIndirizzo, setPresaIndirizzo] = useState('');
  const [presaCitta, setPresaCitta] = useState('');
  const [orarioPresa, setOrarioPresa] = useState('');
  const [usaOrarioServizio, setUsaOrarioServizio] = useState(true);
  const [usaDestServizio, setUsaDestServizio] = useState(true);
  const [destIndirizzo, setDestIndirizzo] = useState('');
  const [destCitta, setDestCitta] = useState('');

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setModalita(hasIndirizzo ? 'scelta' : 'personalizza');
      // Pre-fill from existing config
      const pt = passeggero._presa_tipo || 'servizio';
      const dt = passeggero._destinazione_tipo || 'servizio';
      setUsaPresaServizio(pt === 'servizio');
      setPresaIndirizzo(passeggero.luogo_presa_personalizzato || '');
      setPresaCitta(passeggero.localita_presa_personalizzato || '');
      setOrarioPresa(passeggero.orario_presa_personalizzato || '');
      setUsaOrarioServizio(passeggero._usa_orario_servizio ?? true);
      setUsaDestServizio(dt === 'servizio');
      setDestIndirizzo(passeggero.destinazione_personalizzato || '');
      setDestCitta(passeggero.localita_destinazione_personalizzato || '');
    }
  }, [open, passeggero, hasIndirizzo]);

  const passeggeroIndirizzo = [passeggero.indirizzo, passeggero.localita].filter(Boolean).join(", ");
  const presaServizioDisplay = [datiServizio.indirizzoPresaServizio, datiServizio.cittaPresaServizio].filter(Boolean).join(", ");
  const destServizioDisplay = [datiServizio.indirizzoDestinazioneServizio, datiServizio.cittaDestinazioneServizio].filter(Boolean).join(", ");

  const handleQuickSelect = (tipo: 'passeggero' | 'servizio') => {
    onConfirm({
      presaTipo: tipo,
      destinazioneTipo: 'servizio',
      luogoPresa: tipo === 'passeggero' ? (passeggero.indirizzo || null) : null,
      localitaPresa: tipo === 'passeggero' ? (passeggero.localita || null) : null,
      destinazione: null,
      localitaDestinazione: null,
      orarioPresaPersonalizzato: null,
      usaOrarioServizio: true,
    });
  };

  const handleConfirmPersonalizza = () => {
    const isPresa = usaPresaServizio ? 'servizio' : 'personalizzato';
    const isDest = usaDestServizio ? 'servizio' : 'personalizzato';

    onConfirm({
      presaTipo: isPresa as PercorsoConfig['presaTipo'],
      destinazioneTipo: isDest as PercorsoConfig['destinazioneTipo'],
      luogoPresa: usaPresaServizio ? null : (presaIndirizzo || null),
      localitaPresa: usaPresaServizio ? null : (presaCitta || null),
      destinazione: usaDestServizio ? null : (destIndirizzo || null),
      localitaDestinazione: usaDestServizio ? null : (destCitta || null),
      orarioPresaPersonalizzato: usaOrarioServizio ? null : (orarioPresa || null),
      usaOrarioServizio,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {passeggero.nome_cognome}
          </DialogTitle>
          {passeggeroIndirizzo && (
            <DialogDescription>
              Indirizzo: {passeggeroIndirizzo}
            </DialogDescription>
          )}
        </DialogHeader>

        {modalita === 'scelta' ? (
          /* MODALITÀ A: Scelta Rapida */
          <div className="space-y-3 py-2">
            {/* Card 1: Indirizzo Passeggero */}
            {hasIndirizzo && (
              <Card
                className="p-4 cursor-pointer border-2 hover:border-primary/50 transition-colors"
                onClick={() => handleQuickSelect('passeggero')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 font-medium">
                      <Home className="h-4 w-4 text-primary flex-shrink-0" />
                      Indirizzo Passeggero
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{passeggeroIndirizzo}</p>
                    {datiServizio.orarioServizio && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Orario: {datiServizio.orarioServizio}
                      </p>
                    )}
                  </div>
                  <Button size="sm" variant="outline" className="flex-shrink-0">
                    Seleziona <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </Card>
            )}

            {/* Card 2: Indirizzo Partenza Servizio */}
            <Card
              className="p-4 cursor-pointer border-2 hover:border-primary/50 transition-colors"
              onClick={() => handleQuickSelect('servizio')}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 font-medium">
                    <Car className="h-4 w-4 text-primary flex-shrink-0" />
                    Partenza Servizio
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {presaServizioDisplay || "Non specificato"}
                  </p>
                  {datiServizio.orarioServizio && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Orario: {datiServizio.orarioServizio}
                    </p>
                  )}
                </div>
                <Button size="sm" variant="outline" className="flex-shrink-0">
                  Seleziona <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </Card>

            {/* Card 3: Personalizza */}
            <Card
              className="p-4 cursor-pointer border-2 border-dashed hover:border-primary/50 transition-colors"
              onClick={() => setModalita('personalizza')}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-medium">
                    <Pencil className="h-4 w-4 text-primary flex-shrink-0" />
                    Personalizza Percorso
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Imposta punti diversi per presa e destinazione
                  </p>
                </div>
                <Button size="sm" variant="outline" className="flex-shrink-0">
                  Personalizza <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          /* MODALITÀ B: Form Personalizzazione */
          <div className="space-y-4 py-2">
            {/* Punto di Presa */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
                <Car className="h-4 w-4" />
                Punto di Presa
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="usa-presa-servizio"
                  checked={usaPresaServizio}
                  onCheckedChange={(checked) => setUsaPresaServizio(!!checked)}
                />
                <Label htmlFor="usa-presa-servizio" className="text-sm cursor-pointer">
                  Usa indirizzo partenza servizio
                  {presaServizioDisplay && (
                    <span className="text-muted-foreground ml-1">({presaServizioDisplay})</span>
                  )}
                </Label>
              </div>
              {!usaPresaServizio && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                  <div>
                    <Label className="text-xs">Città</Label>
                    <Input
                      placeholder="Città"
                      value={presaCitta}
                      onChange={(e) => setPresaCitta(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Indirizzo</Label>
                    <Input
                      placeholder="Via, numero civico"
                      value={presaIndirizzo}
                      onChange={(e) => setPresaIndirizzo(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Orario */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="usa-orario-servizio"
                  checked={usaOrarioServizio}
                  onCheckedChange={(checked) => setUsaOrarioServizio(!!checked)}
                />
                <Label htmlFor="usa-orario-servizio" className="text-sm cursor-pointer">
                  Usa orario servizio
                  {datiServizio.orarioServizio && (
                    <span className="text-muted-foreground ml-1">({datiServizio.orarioServizio})</span>
                  )}
                </Label>
              </div>
              {!usaOrarioServizio && (
                <div className="pl-6">
                  <Label className="text-xs">Orario presa</Label>
                  <Input
                    type="time"
                    value={orarioPresa}
                    onChange={(e) => setOrarioPresa(e.target.value)}
                    className="w-32 mt-1"
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* Punto di Destinazione */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
                <Navigation className="h-4 w-4" />
                Punto di Destinazione
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="usa-dest-servizio"
                  checked={usaDestServizio}
                  onCheckedChange={(checked) => setUsaDestServizio(!!checked)}
                />
                <Label htmlFor="usa-dest-servizio" className="text-sm cursor-pointer">
                  Usa destinazione servizio
                  {destServizioDisplay && (
                    <span className="text-muted-foreground ml-1">({destServizioDisplay})</span>
                  )}
                </Label>
              </div>
              {!usaDestServizio && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                  <div>
                    <Label className="text-xs">Città</Label>
                    <Input
                      placeholder="Città"
                      value={destCitta}
                      onChange={(e) => setDestCitta(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Indirizzo</Label>
                    <Input
                      placeholder="Via, numero civico"
                      value={destIndirizzo}
                      onChange={(e) => setDestIndirizzo(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="flex-row gap-2">
          {modalita === 'personalizza' && hasIndirizzo && (
            <Button variant="ghost" onClick={() => setModalita('scelta')} className="mr-auto">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Indietro
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          {modalita === 'personalizza' && (
            <Button onClick={handleConfirmPersonalizza}>
              <Check className="h-4 w-4 mr-1" />
              Conferma
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
