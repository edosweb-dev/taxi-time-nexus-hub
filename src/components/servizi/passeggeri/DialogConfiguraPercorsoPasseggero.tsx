import { useState, useEffect, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Check, MapPin } from "lucide-react";
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
      <ToggleGroupItem value={value} disabled={disabled} className="px-4 py-3 text-sm">
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
          "flex flex-col p-0",
          isMobile ? "h-[95vh] w-full rounded-t-xl" : "w-full max-w-lg"
        )}
        hideCloseButton
      >
        <SheetHeader className="px-6 pt-6 pb-4 space-y-2">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <MapPin className="w-5 h-5 text-primary" />
            {passeggero.nome_cognome}
          </SheetTitle>
          {passeggeroIndirizzo && (
            <p className="text-sm text-muted-foreground pl-7">
              📍 Indirizzo salvato: {passeggeroIndirizzo}
            </p>
          )}
        </SheetHeader>

        <TooltipProvider>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8">
            {/* PARTENZA */}
            <div className="space-y-4">
              <Label className="text-base font-semibold block">Scegli indirizzo partenza</Label>
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
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">Usa: {passeggeroIndirizzo}</p>
                </div>
              )}
              {partenzaTipo === 'servizio' && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">Usa: {presaServizioDisplay || "Non specificato"}</p>
                </div>
              )}
              {partenzaTipo === 'personalizzato' && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr] gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Città</Label>
                      <Input value={presaCitta} onChange={(e) => setPresaCitta(e.target.value)} placeholder="Milano" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Indirizzo</Label>
                      <Input value={presaIndirizzo} onChange={(e) => setPresaIndirizzo(e.target.value)} placeholder="Via, numero civico" className="h-11" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Orario presa</Label>
                    <Input type="time" value={orarioPresa} onChange={(e) => setOrarioPresa(e.target.value)} className="h-11 w-full sm:w-40" />
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* ARRIVO */}
            <div className="space-y-4">
              <Label className="text-base font-semibold block">Scegli indirizzo arrivo</Label>
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
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">Usa: {passeggeroIndirizzo}</p>
                </div>
              )}
              {arrivoTipo === 'servizio' && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">Usa: {destServizioDisplay || "Non specificato"}</p>
                </div>
              )}
              {arrivoTipo === 'personalizzato' && (
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr] gap-4 pt-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Città</Label>
                    <Input value={destCitta} onChange={(e) => setDestCitta(e.target.value)} placeholder="Milano" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Indirizzo</Label>
                    <Input value={destIndirizzo} onChange={(e) => setDestIndirizzo(e.target.value)} placeholder="Via, numero civico" className="h-11" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </TooltipProvider>

        <SheetFooter className="sticky bottom-0 bg-background border-t px-6 py-4 flex-row gap-3 mt-auto">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 h-11">
            Annulla
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid} className="flex-1 h-11">
            <Check className="h-4 w-4 mr-2" />
            Conferma
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
