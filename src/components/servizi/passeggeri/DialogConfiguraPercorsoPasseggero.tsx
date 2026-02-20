import { useState, useEffect, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Check, MapPin, Home, MapPinned, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { PasseggeroClienteData } from "./PasseggeroClienteCard";

export interface PercorsoConfig {
  presaTipo: 'servizio' | 'passeggero' | 'personalizzato' | 'primo_passeggero';
  destinazioneTipo: 'servizio' | 'passeggero' | 'personalizzato' | 'primo_passeggero';
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
  index?: number;
  primoPasseggero?: PasseggeroClienteData;
  datiServizio: DatiServizio;
  onConfirm: (config: PercorsoConfig) => void;
}

type TipoIndirizzo = 'passeggero' | 'servizio' | 'personalizzato' | 'primo_passeggero';

const getIndirizzoPresaPrimo = (primo: PasseggeroClienteData): string => {
  if (primo._presa_tipo === 'personalizzato') {
    return [primo.luogo_presa_personalizzato, primo.localita_presa_personalizzato].filter(Boolean).join(", ") || 'Non specificato';
  } else if (primo._presa_tipo === 'passeggero') {
    return [primo.indirizzo, primo.localita].filter(Boolean).join(", ") || 'Non specificato';
  }
  return 'Non specificato';
};

const getIndirizzoDestinazionePrimo = (primo: PasseggeroClienteData): string => {
  if (primo._destinazione_tipo === 'personalizzato') {
    return [primo.destinazione_personalizzato, primo.localita_destinazione_personalizzato].filter(Boolean).join(", ") || 'Non specificato';
  } else if (primo._destinazione_tipo === 'passeggero') {
    return [primo.indirizzo, primo.localita].filter(Boolean).join(", ") || 'Non specificato';
  }
  return 'Non specificato';
};

export const DialogConfiguraPercorsoPasseggero = ({
  open,
  onOpenChange,
  passeggero,
  index = 0,
  primoPasseggero,
  datiServizio,
  onConfirm,
}: DialogConfiguraPercorsoPasseggeroProps) => {
  const isMobile = useIsMobile();
  const hasIndirizzo = !!(passeggero.indirizzo || passeggero.localita);
  const isFirst = index === 0;

  const [partenzaTipo, setPartenzaTipo] = useState<TipoIndirizzo>('personalizzato');
  const [arrivoTipo, setArrivoTipo] = useState<TipoIndirizzo>('personalizzato');
  const [presaIndirizzo, setPresaIndirizzo] = useState('');
  const [presaCitta, setPresaCitta] = useState('');
  const [orarioPresa, setOrarioPresa] = useState('');
  const [destIndirizzo, setDestIndirizzo] = useState('');
  const [destCitta, setDestCitta] = useState('');

  useEffect(() => {
    if (open) {
      const savedPresa = (passeggero._presa_tipo as TipoIndirizzo) || (hasIndirizzo ? 'passeggero' : 'personalizzato');
      const savedArrivo = (passeggero._destinazione_tipo as TipoIndirizzo) || 'personalizzato';
      // If "servizio" was saved before, map to appropriate default
      setPartenzaTipo(savedPresa === 'servizio' ? (isFirst ? 'personalizzato' : 'primo_passeggero') : savedPresa);
      setArrivoTipo(savedArrivo === 'servizio' ? (isFirst ? 'personalizzato' : 'primo_passeggero') : savedArrivo);
      setPresaIndirizzo(passeggero.luogo_presa_personalizzato || '');
      setPresaCitta(passeggero.localita_presa_personalizzato || '');
      setOrarioPresa(passeggero.orario_presa_personalizzato || '');
      setDestIndirizzo(passeggero.destinazione_personalizzato || '');
      setDestCitta(passeggero.localita_destinazione_personalizzato || '');
    }
  }, [open, passeggero, hasIndirizzo, isFirst]);

  const passeggeroIndirizzo = [passeggero.indirizzo, passeggero.localita].filter(Boolean).join(", ");

  const isValid = useMemo(() => {
    if (partenzaTipo === 'personalizzato' && !presaCitta && !presaIndirizzo) return false;
    if (partenzaTipo === 'passeggero' && !orarioPresa) return false;
    if (arrivoTipo === 'personalizzato' && !destCitta && !destIndirizzo) return false;
    return true;
  }, [partenzaTipo, arrivoTipo, presaCitta, presaIndirizzo, destCitta, destIndirizzo, orarioPresa]);

  const handleConfirm = () => {
    onConfirm({
      presaTipo: partenzaTipo === 'primo_passeggero' ? 'primo_passeggero' : partenzaTipo,
      destinazioneTipo: arrivoTipo === 'primo_passeggero' ? 'primo_passeggero' : arrivoTipo,
      luogoPresa: partenzaTipo === 'personalizzato' ? (presaIndirizzo || null) :
                  partenzaTipo === 'passeggero' ? (passeggero.indirizzo || null) : null,
      localitaPresa: partenzaTipo === 'personalizzato' ? (presaCitta || null) :
                     partenzaTipo === 'passeggero' ? (passeggero.localita || null) : null,
      destinazione: arrivoTipo === 'personalizzato' ? (destIndirizzo || null) :
                    arrivoTipo === 'passeggero' ? (passeggero.indirizzo || null) : null,
      localitaDestinazione: arrivoTipo === 'personalizzato' ? (destCitta || null) :
                            arrivoTipo === 'passeggero' ? (passeggero.localita || null) : null,
      orarioPresaPersonalizzato: 
        partenzaTipo === 'primo_passeggero'
          ? (primoPasseggero?.orario_presa_personalizzato || null)
          : (partenzaTipo === 'personalizzato' || partenzaTipo === 'passeggero') ? (orarioPresa || null) : null,
      usaOrarioServizio: partenzaTipo === 'primo_passeggero'
        ? (primoPasseggero?._usa_orario_servizio ?? true)
        : false,
    });
  };

  const toggleItemClass = "px-4 py-3 text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground";

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
                  <MapPinned className="w-4 h-4 text-primary" />
                </div>
                <Label className="text-base font-bold uppercase tracking-wide">Partenza</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Scegli l'indirizzo di partenza del cliente.
              </p>

              <ToggleGroup
                type="single"
                value={partenzaTipo}
                onValueChange={(v) => v && setPartenzaTipo(v as TipoIndirizzo)}
                className="grid grid-cols-1 gap-2 w-full"
              >
                {/* Stesso del primo - solo per passeggeri successivi */}
                {!isFirst && primoPasseggero && (
                  <ToggleGroupItem value="primo_passeggero" className={cn(toggleItemClass, "justify-start text-left")}>
                    <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Stesso del primo</span>
                      <span className="text-xs opacity-70 truncate max-w-[200px]">
                        {primoPasseggero.nome_cognome}
                      </span>
                    </div>
                  </ToggleGroupItem>
                )}
                {/* Indirizzo passeggero */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem value="passeggero" disabled={!hasIndirizzo} className={cn(toggleItemClass, "justify-start text-left")}>
                      <Home className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="font-medium">Indirizzo passeggero</span>
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  {!hasIndirizzo && <TooltipContent>Nessun indirizzo salvato</TooltipContent>}
                </Tooltip>
                {/* Personalizzato */}
                <ToggleGroupItem value="personalizzato" className={cn(toggleItemClass, "justify-start text-left")}>
                  <MapPinned className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="font-medium">Personalizza</span>
                </ToggleGroupItem>
              </ToggleGroup>

              {/* Preview "Stesso del primo" */}
              {partenzaTipo === 'primo_passeggero' && primoPasseggero && (
                <div className="rounded-lg bg-primary/5 p-4 border border-primary/20 space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{getIndirizzoPresaPrimo(primoPasseggero)}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">Stesso indirizzo del primo passeggero</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pl-6">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      Orario: {primoPasseggero._usa_orario_servizio
                        ? `${datiServizio.orarioServizio} (orario servizio)`
                        : primoPasseggero.orario_presa_personalizzato || 'Non specificato'}
                    </span>
                  </div>
                </div>
              )}

              {/* Indirizzo passeggero */}
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

              {/* Personalizzato */}
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
                Scegli l'indirizzo di arrivo del cliente.
              </p>

              <ToggleGroup
                type="single"
                value={arrivoTipo}
                onValueChange={(v) => v && setArrivoTipo(v as TipoIndirizzo)}
                className="grid grid-cols-1 gap-2 w-full"
              >
                {/* Stesso del primo */}
                {!isFirst && primoPasseggero && (
                  <ToggleGroupItem value="primo_passeggero" className={cn(toggleItemClass, "justify-start text-left")}>
                    <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Stesso del primo</span>
                      <span className="text-xs opacity-70 truncate max-w-[200px]">
                        {primoPasseggero.nome_cognome}
                      </span>
                    </div>
                  </ToggleGroupItem>
                )}
                {/* Indirizzo passeggero */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem value="passeggero" disabled={!hasIndirizzo} className={cn(toggleItemClass, "justify-start text-left")}>
                      <Home className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="font-medium">Indirizzo passeggero</span>
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  {!hasIndirizzo && <TooltipContent>Nessun indirizzo salvato</TooltipContent>}
                </Tooltip>
                {/* Personalizzato */}
                <ToggleGroupItem value="personalizzato" className={cn(toggleItemClass, "justify-start text-left")}>
                  <MapPinned className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="font-medium">Personalizza</span>
                </ToggleGroupItem>
              </ToggleGroup>

              {/* Preview "Stesso del primo" */}
              {arrivoTipo === 'primo_passeggero' && primoPasseggero && (
                <div className="rounded-lg bg-primary/5 p-4 border border-primary/20">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{getIndirizzoDestinazionePrimo(primoPasseggero)}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">Stessa destinazione del primo passeggero</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Indirizzo passeggero */}
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

              {/* Personalizzato */}
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
