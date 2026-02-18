import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { User, X, MapPin, Navigation, Clock } from "lucide-react";

export interface PasseggeroClienteData {
  id?: string;
  nome_cognome: string;
  email?: string;
  telefono?: string;
  isNew: boolean;
  // Custom address fields
  usa_indirizzo_personalizzato?: boolean;
  luogo_presa_personalizzato?: string;
  localita_presa_personalizzato?: string;
  orario_presa_personalizzato?: string;
  destinazione_personalizzato?: string;
  localita_destinazione_personalizzato?: string;
  ordine_presa?: number;
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
  const isCustom = passeggero.usa_indirizzo_personalizzato || false;

  const presaServizioDisplay = [indirizzoPresaServizio, cittaPresaServizio].filter(Boolean).join(", ");
  const destServizioDisplay = [indirizzoDestinazioneServizio, cittaDestinazioneServizio].filter(Boolean).join(", ");

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

      {/* Toggle indirizzo personalizzato */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t">
        <Label htmlFor={`custom-addr-${index}`} className="text-sm cursor-pointer">
          Indirizzo personalizzato
        </Label>
        <Switch
          id={`custom-addr-${index}`}
          checked={isCustom}
          onCheckedChange={(checked) => {
            onUpdate({ usa_indirizzo_personalizzato: checked });
            if (!checked) {
              // Reset custom fields when disabling
              onUpdate({
                usa_indirizzo_personalizzato: false,
                luogo_presa_personalizzato: undefined,
                localita_presa_personalizzato: undefined,
                orario_presa_personalizzato: undefined,
                destinazione_personalizzato: undefined,
                localita_destinazione_personalizzato: undefined,
              });
            }
          }}
        />
      </div>

      {!isCustom ? (
        <p className="text-xs text-muted-foreground">
          Userà il percorso del servizio
          {presaServizioDisplay && `: ${presaServizioDisplay}`}
          {destServizioDisplay && ` → ${destServizioDisplay}`}
        </p>
      ) : (
        <div className="space-y-4">
          {/* Orario presa personalizzato */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <Clock className="h-3.5 w-3.5" />
              Orario presa
            </div>
            <Input
              type="time"
              value={passeggero.orario_presa_personalizzato || ""}
              onChange={(e) => onUpdate({ orario_presa_personalizzato: e.target.value })}
              className="w-32"
            />
          </div>

          {/* Presa personalizzata */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <MapPin className="h-3.5 w-3.5" />
              Punto di presa
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Indirizzo</Label>
                <Input
                  placeholder={indirizzoPresaServizio || "Via, numero civico"}
                  value={passeggero.luogo_presa_personalizzato || ""}
                  onChange={(e) => onUpdate({ luogo_presa_personalizzato: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Città</Label>
                <Input
                  placeholder={cittaPresaServizio || "Città"}
                  value={passeggero.localita_presa_personalizzato || ""}
                  onChange={(e) => onUpdate({ localita_presa_personalizzato: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Destinazione personalizzata */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <Navigation className="h-3.5 w-3.5" />
              Destinazione
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Indirizzo</Label>
                <Input
                  placeholder={indirizzoDestinazioneServizio || "Via, numero civico"}
                  value={passeggero.destinazione_personalizzato || ""}
                  onChange={(e) => onUpdate({ destinazione_personalizzato: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Città</Label>
                <Input
                  placeholder={cittaDestinazioneServizio || "Città"}
                  value={passeggero.localita_destinazione_personalizzato || ""}
                  onChange={(e) => onUpdate({ localita_destinazione_personalizzato: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
