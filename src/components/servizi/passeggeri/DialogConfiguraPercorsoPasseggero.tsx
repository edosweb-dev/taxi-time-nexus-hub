import { useState, useEffect, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Check, MapPin } from "lucide-react";
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
    if (arrivoTipo === 'personalizzato' && !destCitta && !destIndirizzo) return false;
    return true;
  }, [partenzaTipo, arrivoTipo, presaCitta, presaIndirizzo, destCitta, destIndirizzo]);

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
      orarioPresaPersonalizzato: partenzaTipo === 'personalizzato' ? (orarioPresa || null) : null,
      usaOrarioServizio: partenzaTipo !== 'personalizzato',
    });
  };

  const renderToggleItem = (value: string, label: string, disabled?: boolean, tooltip?: string) => {
    const item = (
      <ToggleGroupItem value={value} disabled={disabled} className="text-xs sm:text-sm">
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
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {passeggero.nome_cognome}
          </SheetTitle>
          {passeggeroIndirizzo && (
            <p className="text-sm text-muted-foreground">
              📍 Indirizzo salvato: {passeggeroIndirizzo}
            </p>
          )}
        </SheetHeader>

        <TooltipProvider>
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* PARTENZA */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Scegli indirizzo partenza</Label>
              <ToggleGroup
                type="single"
                value={partenzaTipo}
                onValueChange={(v) => v && setPartenzaTipo(v as TipoIndirizzo)}
                className="grid grid-cols-3"
              >
                {renderToggleItem('passeggero', 'Passeggero', !hasIndirizzo, 'Nessun indirizzo salvato')}
                {renderToggleItem('servizio', 'Servizio')}
                {renderToggleItem('personalizzato', 'Personalizzato')}
              </ToggleGroup>

              {partenzaTipo === 'passeggero' && hasIndirizzo && (
                <p className="text-sm text-muted-foreground">Usa: {passeggeroIndirizzo}</p>
              )}
              {partenzaTipo === 'servizio' && (
                <p className="text-sm text-muted-foreground">Usa: {presaServizioDisplay || "Non specificato"}</p>
              )}
              {partenzaTipo === 'personalizzato' && (
                <div className="space-y-3 mt-1">
                  <div>
                    <Label className="text-xs">Città</Label>
                    <Input value={presaCitta} onChange={(e) => setPresaCitta(e.target.value)} placeholder="Città" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Indirizzo</Label>
                    <Input value={presaIndirizzo} onChange={(e) => setPresaIndirizzo(e.target.value)} placeholder="Via, numero civico" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Orario presa</Label>
                    <Input type="time" value={orarioPresa} onChange={(e) => setOrarioPresa(e.target.value)} className="w-32 mt-1" />
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* ARRIVO */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Scegli indirizzo arrivo</Label>
              <ToggleGroup
                type="single"
                value={arrivoTipo}
                onValueChange={(v) => v && setArrivoTipo(v as TipoIndirizzo)}
                className="grid grid-cols-3"
              >
                {renderToggleItem('passeggero', 'Passeggero', !hasIndirizzo, 'Nessun indirizzo salvato')}
                {renderToggleItem('servizio', 'Servizio')}
                {renderToggleItem('personalizzato', 'Personalizzato')}
              </ToggleGroup>

              {arrivoTipo === 'passeggero' && hasIndirizzo && (
                <p className="text-sm text-muted-foreground">Usa: {passeggeroIndirizzo}</p>
              )}
              {arrivoTipo === 'servizio' && (
                <p className="text-sm text-muted-foreground">Usa: {destServizioDisplay || "Non specificato"}</p>
              )}
              {arrivoTipo === 'personalizzato' && (
                <div className="space-y-3 mt-1">
                  <div>
                    <Label className="text-xs">Città</Label>
                    <Input value={destCitta} onChange={(e) => setDestCitta(e.target.value)} placeholder="Città" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Indirizzo</Label>
                    <Input value={destIndirizzo} onChange={(e) => setDestIndirizzo(e.target.value)} placeholder="Via, numero civico" className="mt-1" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </TooltipProvider>

        <SheetFooter className="sticky bottom-0 bg-background border-t px-6 py-4 flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Annulla
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid} className="flex-1">
            <Check className="h-4 w-4 mr-1" />
            Conferma
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
