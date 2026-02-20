import { useState, useEffect, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Check, MapPin, Home, Car, MapPinned } from "lucide-react";
import { cn } from "@/lib/utils";
import { PasseggeroClienteData } from "./PasseggeroClienteCard";

export interface PercorsoConfig {
  presaTipo: 'servizio' | 'passeggero' | 'personalizzato';
  destinazioneTipo: 'servizio' | 'passeggero' | 'personalizzato';
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

type TipoIndirizzo = 'passeggero' | 'servizio' | 'personalizzato';

export const DialogConfiguraPercorsoPasseggero = ({
  open,
  onOpenChange,
  passeggero,
  datiServizio,
  onConfirm,
}: DialogConfiguraPercorsoPasseggeroProps) => {
  const isMobile = useIsMobile();
  const hasIndirizzo = !!(passeggero.indirizzo || passeggero.localita);

  const [partenzaTipo, setPartenzaTipo] = useState<TipoIndirizzo>('servizio');
  const [arrivoTipo, setArrivoTipo] = useState<TipoIndirizzo>('servizio');
  const [presaIndirizzo, setPresaIndirizzo] = useState('');
  const [presaCitta, setPresaCitta] = useState('');
  const [orarioPresa, setOrarioPresa] = useState('');
  const [destIndirizzo, setDestIndirizzo] = useState('');
  const [destCitta, setDestCitta] = useState('');

  useEffect(() => {
    if (open) {
      setPartenzaTipo((passeggero._presa_tipo as TipoIndirizzo) || 'servizio');
      setArrivoTipo((passeggero._destinazione_tipo as TipoIndirizzo) || 'servizio');
      setPresaIndirizzo(passeggero.luogo_presa_personalizzato || '');
      setPresaCitta(passeggero.localita_presa_personalizzato || '');
      setOrarioPresa(passeggero.orario_presa_personalizzato || '');
      setDestIndirizzo(passeggero.destinazione_personalizzato || '');
      setDestCitta(passeggero.localita_destinazione_personalizzato || '');
    }
  }, [open, passeggero]);

  const passeggeroIndirizzo = [passeggero.indirizzo, passeggero.localita].filter(Boolean).join(", ");
  const presaServizioDisplay = [datiServizio.indirizzoPresaServizio, datiServizio.cittaPresaServizio].filter(Boolean).join(", ");
  const destServizioDisplay = [datiServizio.indirizzoDestinazioneServizio, datiServizio.cittaDestinazioneServizio].filter(Boolean).join(", ");

  const isValid = useMemo(() => {
    if (partenzaTipo === 'personalizzato' && !presaCitta && !presaIndirizzo) return false;
    if (partenzaTipo === 'passeggero' && !orarioPresa) return false;
    if (arrivoTipo === 'personalizzato' && !destCitta && !destIndirizzo) return false;
    return true;
  }, [partenzaTipo, arrivoTipo, presaCitta, presaIndirizzo, destCitta, destIndirizzo, orarioPresa]);

  const handleConfirm = () => {
    onConfirm({
      presaTipo: partenzaTipo,
      destinazioneTipo: arrivoTipo,
      luogoPresa: partenzaTipo === 'personalizzato' ? (presaIndirizzo || null) :
                  partenzaTipo === 'passeggero' ? (passeggero.indirizzo || null) : null,
      localitaPresa: partenzaTipo === 'personalizzato' ? (presaCitta || null) :
                     partenzaTipo === 'passeggero' ? (passeggero.localita || null) : null,
      destinazione: arrivoTipo === 'personalizzato' ? (destIndirizzo || null) :
                    arrivoTipo === 'passeggero' ? (passeggero.indirizzo || null) : null,
      localitaDestinazione: arrivoTipo === 'personalizzato' ? (destCitta || null) :
                            arrivoTipo === 'passeggero' ? (passeggero.localita || null) : null,
      orarioPresaPersonalizzato: (partenzaTipo === 'personalizzato' || partenzaTipo === 'passeggero') ? (orarioPresa || null) : null,
      usaOrarioServizio: partenzaTipo === 'servizio',
    });
  };

  const toggleItemClass = "px-4 py-3 text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground";

  const renderToggleItem = (value: string, label: string, disabled?: boolean, tooltip?: string) => {
    const item = (
      <ToggleGroupItem value={value} disabled={disabled} className={toggleItemClass}>
        {label}
      </ToggleGroupItem>
    );
    if (disabled && tooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{item}</TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      );
    }
    return item;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "flex flex-col px-6 py-6",
          isMobile ? "h-[95vh] w-full rounded-t-xl" : "w-full max-w-lg"
        )}
        hideCloseButton
      >
        {/* HEADER */}
        <SheetHeader className="space-y-3 pb-6 border-b">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <MapPin className="w-5 h-5 text-primary" />
            {passeggero.nome_cognome}
          </SheetTitle>
          {passeggeroIndirizzo && (
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Home className="w-4 h-4" />
                <span>Indirizzo salvato: <strong>{passeggeroIndirizzo}</strong></span>
              </p>
            </div>
          )}
        </SheetHeader>

        <TooltipProvider>
          <div className="flex-1 overflow-y-auto py-6 space-y-6">
            {/* ===== PARTENZA ===== */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Car className="w-4 h-4 text-primary" />
                </div>
                <Label className="text-base font-bold uppercase tracking-wide">Partenza</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Scegli l'indirizzo di partenza del cliente. Puoi scegliere tra indirizzo di residenza, indirizzo del servizio o personalizzato.
              </p>

              <ToggleGroup
                type="single"
                value={partenzaTipo}
                onValueChange={(v) => v && setPartenzaTipo(v as TipoIndirizzo)}
                className="grid grid-cols-3 gap-2 w-full"
              >
                {renderToggleItem('passeggero', 'Passeggero', !hasIndirizzo, 'Nessun indirizzo salvato')}
                {renderToggleItem('servizio', 'Servizio')}
                {renderToggleItem('personalizzato', 'Custom')}
              </ToggleGroup>

              {partenzaTipo === 'passeggero' && hasIndirizzo && (
                <div className="space-y-3 rounded-lg bg-primary/5 p-4 border border-primary/20">
                  <div className="flex items-start gap-2 text-sm">
                    <Home className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{passeggeroIndirizzo}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">Indirizzo dalla rubrica</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Orario di presa *</Label>
                    <Input type="time" value={orarioPresa} onChange={(e) => setOrarioPresa(e.target.value)} className="h-11 w-full sm:w-40 bg-background" />
                    <p className="text-xs text-muted-foreground">Specifica quando prelevare il passeggero a questo indirizzo</p>
                  </div>
                </div>
              )}
              {partenzaTipo === 'servizio' && (
                <div className="rounded-lg bg-primary/5 p-4 border border-primary/20">
                  <div className="flex items-start gap-2 text-sm">
                    <Car className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{presaServizioDisplay || "Non specificato"}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">Partenza del servizio</p>
                    </div>
                  </div>
                </div>
              )}
              {partenzaTipo === 'personalizzato' && (
                <div className="space-y-3 rounded-lg bg-primary/5 p-4 border border-primary/20">
                  <div className="flex items-start gap-2 text-sm mb-1">
                    <MapPinned className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                    <span className="font-medium text-foreground">Indirizzo personalizzato</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr] gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Città *</Label>
                      <Input value={presaCitta} onChange={(e) => setPresaCitta(e.target.value)} placeholder="es. Milano" className="h-11 bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Indirizzo *</Label>
                      <Input value={presaIndirizzo} onChange={(e) => setPresaIndirizzo(e.target.value)} placeholder="Via, numero civico" className="h-11 bg-background" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Orario presa</Label>
                    <Input type="time" value={orarioPresa} onChange={(e) => setOrarioPresa(e.target.value)} className="h-11 w-full sm:w-40 bg-background" />
                  </div>
                </div>
              )}
            </div>

            {/* ===== SEPARATOR ===== */}
            <div className="relative py-2">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-background px-4 text-xs text-muted-foreground font-medium">• • •</div>
              </div>
            </div>

            {/* ===== ARRIVO ===== */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPinned className="w-4 h-4 text-primary" />
                </div>
                <Label className="text-base font-bold uppercase tracking-wide">Arrivo</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Scegli l'indirizzo di arrivo del cliente. Puoi scegliere tra indirizzo di residenza, indirizzo del servizio o personalizzato.
              </p>

              <ToggleGroup
                type="single"
                value={arrivoTipo}
                onValueChange={(v) => v && setArrivoTipo(v as TipoIndirizzo)}
                className="grid grid-cols-3 gap-2 w-full"
              >
                {renderToggleItem('passeggero', 'Passeggero', !hasIndirizzo, 'Nessun indirizzo salvato')}
                {renderToggleItem('servizio', 'Servizio')}
                {renderToggleItem('personalizzato', 'Custom')}
              </ToggleGroup>

              {arrivoTipo === 'passeggero' && hasIndirizzo && (
                <div className="rounded-lg bg-primary/5 p-4 border border-primary/20">
                  <div className="flex items-start gap-2 text-sm">
                    <Home className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{passeggeroIndirizzo}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">Indirizzo dalla rubrica</p>
                    </div>
                  </div>
                </div>
              )}
              {arrivoTipo === 'servizio' && (
                <div className="rounded-lg bg-primary/5 p-4 border border-primary/20">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPinned className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{destServizioDisplay || "Non specificato"}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">Destinazione del servizio</p>
                    </div>
                  </div>
                </div>
              )}
              {arrivoTipo === 'personalizzato' && (
                <div className="space-y-3 rounded-lg bg-primary/5 p-4 border border-primary/20">
                  <div className="flex items-start gap-2 text-sm mb-1">
                    <MapPinned className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                    <span className="font-medium text-foreground">Indirizzo personalizzato</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr] gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Città *</Label>
                      <Input value={destCitta} onChange={(e) => setDestCitta(e.target.value)} placeholder="es. Milano" className="h-11 bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Indirizzo *</Label>
                      <Input value={destIndirizzo} onChange={(e) => setDestIndirizzo(e.target.value)} placeholder="Via, numero civico" className="h-11 bg-background" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TooltipProvider>

        {/* FOOTER */}
        <SheetFooter className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t shadow-lg -mx-6 px-6 pt-4 pb-6 flex-row gap-3 mt-auto">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 h-12 text-base">
            Annulla
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid} className="flex-1 h-12 text-base font-semibold">
            <Check className="h-5 w-5 mr-2" />
            Conferma
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
