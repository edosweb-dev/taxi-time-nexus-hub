import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, MapPin, Navigation, Clock } from "lucide-react";

export interface PasseggeroClienteData {
  id?: string;
  nome_cognome: string;
  email?: string;
  telefono?: string;
  isNew: boolean;
  // Indirizzo passeggero (dalla rubrica)
  indirizzo?: string;
  localita?: string;
  // Custom address fields (mapped to DB)
  usa_indirizzo_personalizzato?: boolean;
  luogo_presa_personalizzato?: string;
  localita_presa_personalizzato?: string;
  orario_presa_personalizzato?: string;
  destinazione_personalizzato?: string;
  localita_destinazione_personalizzato?: string;
  ordine_presa?: number;
  // UI-only state for dropdown selection
  _presa_tipo?: 'servizio' | 'passeggero' | 'personalizzato';
  _destinazione_tipo?: 'servizio' | 'passeggero' | 'personalizzato';
  _usa_orario_servizio?: boolean;
}

interface PasseggeroClienteCardProps {
  passeggero: PasseggeroClienteData;
  index: number;
  onRemove: () => void;
  onUpdate: (data: Partial<PasseggeroClienteData>) => void;
  indirizzoPresaServizio: string;
  cittaPresaServizio: string;
  indirizzoDestinazioneServizio: string;
  cittaDestinazioneServizio: string;
}

export const PasseggeroClienteCard = ({
  passeggero,
  index,
  onRemove,
  onUpdate,
  indirizzoPresaServizio,
  cittaPresaServizio,
  indirizzoDestinazioneServizio,
  cittaDestinazioneServizio,
}: PasseggeroClienteCardProps) => {
  const presaTipo = passeggero._presa_tipo || 'servizio';
  const destinazioneTipo = passeggero._destinazione_tipo || 'servizio';
  const usaOrarioServizio = passeggero._usa_orario_servizio ?? true;

  const presaServizioDisplay = [indirizzoPresaServizio, cittaPresaServizio].filter(Boolean).join(", ");
  const destServizioDisplay = [indirizzoDestinazioneServizio, cittaDestinazioneServizio].filter(Boolean).join(", ");
  const passeggeroIndirizzo = [passeggero.indirizzo, passeggero.localita].filter(Boolean).join(", ");

  const handlePresaTipoChange = (tipo: string) => {
    const isCustom = tipo === 'personalizzato';
    const isPasseggero = tipo === 'passeggero';
    
    onUpdate({
      _presa_tipo: tipo as PasseggeroClienteData['_presa_tipo'],
      usa_indirizzo_personalizzato: isCustom || isPasseggero || destinazioneTipo !== 'servizio',
      ...(tipo === 'servizio' && {
        luogo_presa_personalizzato: undefined,
        localita_presa_personalizzato: undefined,
      }),
      ...(isPasseggero && {
        luogo_presa_personalizzato: passeggero.indirizzo || undefined,
        localita_presa_personalizzato: passeggero.localita || undefined,
      }),
      ...(isCustom && {
        luogo_presa_personalizzato: undefined,
        localita_presa_personalizzato: undefined,
      }),
    });
  };

  const handleDestinazioneTipoChange = (tipo: string) => {
    const isCustom = tipo === 'personalizzato';
    const isPasseggero = tipo === 'passeggero';
    
    onUpdate({
      _destinazione_tipo: tipo as PasseggeroClienteData['_destinazione_tipo'],
      usa_indirizzo_personalizzato: isCustom || isPasseggero || presaTipo !== 'servizio',
      ...(tipo === 'servizio' && {
        destinazione_personalizzato: undefined,
        localita_destinazione_personalizzato: undefined,
      }),
      ...(isPasseggero && {
        destinazione_personalizzato: passeggero.indirizzo || undefined,
        localita_destinazione_personalizzato: passeggero.localita || undefined,
      }),
      ...(isCustom && {
        destinazione_personalizzato: undefined,
        localita_destinazione_personalizzato: undefined,
      }),
    });
  };

  return (
    <Card className="p-3 sm:p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold text-xs flex-shrink-0">
            {index + 1}
          </div>
          <div className="min-w-0">
            <span className="font-medium text-sm truncate block">{passeggero.nome_cognome}</span>
            {passeggero.telefono && (
              <span className="text-xs text-muted-foreground">{passeggero.telefono}</span>
            )}
          </div>
          {passeggero.isNew && <Badge variant="secondary" className="text-xs flex-shrink-0">Nuovo</Badge>}
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="h-8 w-8 p-0 flex-shrink-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4 pt-1 border-t">
        {/* Punto di presa */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
            <MapPin className="h-3.5 w-3.5" />
            Punto di presa
          </div>
          <Select value={presaTipo} onValueChange={handlePresaTipoChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="servizio">
                Partenza servizio{presaServizioDisplay ? ` (${presaServizioDisplay})` : ''}
              </SelectItem>
              {passeggeroIndirizzo && (
                <SelectItem value="passeggero">
                  Indirizzo passeggero ({passeggeroIndirizzo})
                </SelectItem>
              )}
              <SelectItem value="personalizzato">Personalizzato</SelectItem>
            </SelectContent>
          </Select>

          {presaTipo === 'personalizzato' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Indirizzo</Label>
                <Input
                  placeholder="Via, numero civico"
                  value={passeggero.luogo_presa_personalizzato || ""}
                  onChange={(e) => onUpdate({ luogo_presa_personalizzato: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Città</Label>
                <Input
                  placeholder="Città"
                  value={passeggero.localita_presa_personalizzato || ""}
                  onChange={(e) => onUpdate({ localita_presa_personalizzato: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </div>

        {/* Orario presa */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
            <Clock className="h-3.5 w-3.5" />
            Orario presa
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`orario-servizio-${index}`}
              checked={usaOrarioServizio}
              onCheckedChange={(checked) => {
                onUpdate({
                  _usa_orario_servizio: !!checked,
                  ...(checked && { orario_presa_personalizzato: undefined }),
                });
              }}
            />
            <Label htmlFor={`orario-servizio-${index}`} className="text-xs cursor-pointer">
              Usa orario servizio
            </Label>
          </div>
          {!usaOrarioServizio && (
            <Input
              type="time"
              value={passeggero.orario_presa_personalizzato || ""}
              onChange={(e) => onUpdate({ orario_presa_personalizzato: e.target.value })}
              className="w-32"
            />
          )}
        </div>

        {/* Punto di destinazione */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
            <Navigation className="h-3.5 w-3.5" />
            Punto di destinazione
          </div>
          <Select value={destinazioneTipo} onValueChange={handleDestinazioneTipoChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="servizio">
                Destinazione servizio{destServizioDisplay ? ` (${destServizioDisplay})` : ''}
              </SelectItem>
              {passeggeroIndirizzo && (
                <SelectItem value="passeggero">
                  Indirizzo passeggero ({passeggeroIndirizzo})
                </SelectItem>
              )}
              <SelectItem value="personalizzato">Personalizzato</SelectItem>
            </SelectContent>
          </Select>

          {destinazioneTipo === 'personalizzato' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Indirizzo</Label>
                <Input
                  placeholder="Via, numero civico"
                  value={passeggero.destinazione_personalizzato || ""}
                  onChange={(e) => onUpdate({ destinazione_personalizzato: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Città</Label>
                <Input
                  placeholder="Città"
                  value={passeggero.localita_destinazione_personalizzato || ""}
                  onChange={(e) => onUpdate({ localita_destinazione_personalizzato: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
