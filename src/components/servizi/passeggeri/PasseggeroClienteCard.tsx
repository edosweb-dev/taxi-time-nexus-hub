import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Pencil, Home, Car, MapPin, ChevronUp, ChevronDown } from "lucide-react";

export interface PasseggeroClienteData {
  id?: string;
  nome_cognome: string;
  email?: string;
  telefono?: string;
  isNew: boolean;
  isTemporary?: boolean;
  indirizzo?: string;
  localita?: string;
  usa_indirizzo_personalizzato?: boolean;
  luogo_presa_personalizzato?: string;
  localita_presa_personalizzato?: string;
  orario_presa_personalizzato?: string;
  destinazione_personalizzato?: string;
  localita_destinazione_personalizzato?: string;
  ordine_presa?: number;
  _presa_tipo?: 'servizio' | 'passeggero' | 'personalizzato' | 'primo_passeggero';
  _destinazione_tipo?: 'servizio' | 'passeggero' | 'personalizzato' | 'primo_passeggero';
  _usa_orario_servizio?: boolean;
}

interface PasseggeroClienteCardProps {
  passeggero: PasseggeroClienteData;
  index: number;
  onRemove: () => void;
  onConfigura: () => void;
  indirizzoPresaServizio: string;
  cittaPresaServizio: string;
  indirizzoDestinazioneServizio: string;
  cittaDestinazioneServizio: string;
  totalCount?: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const PasseggeroClienteCard = ({
  passeggero,
  index,
  onRemove,
  onConfigura,
  indirizzoPresaServizio,
  cittaPresaServizio,
  indirizzoDestinazioneServizio,
  cittaDestinazioneServizio,
  totalCount = 1,
  onMoveUp,
  onMoveDown,
}: PasseggeroClienteCardProps) => {
  const presaTipo = passeggero._presa_tipo || 'servizio';

  // Compute display address based on config
  const getPresaDisplay = () => {
    switch (presaTipo) {
      case 'passeggero':
        return [passeggero.indirizzo, passeggero.localita].filter(Boolean).join(", ") || "Indirizzo passeggero";
      case 'personalizzato':
        return [passeggero.luogo_presa_personalizzato, passeggero.localita_presa_personalizzato].filter(Boolean).join(", ") || "Personalizzato";
      default:
        return [indirizzoPresaServizio, cittaPresaServizio].filter(Boolean).join(", ") || "Partenza servizio";
    }
  };

  const getConfigBadge = () => {
    switch (presaTipo) {
      case 'passeggero':
        return { icon: <Home className="h-3 w-3" />, label: "Casa", variant: "secondary" as const };
      case 'personalizzato':
        return { icon: <Pencil className="h-3 w-3" />, label: "Custom", variant: "outline" as const };
      default:
        return { icon: <Car className="h-3 w-3" />, label: "Servizio", variant: "secondary" as const };
    }
  };

  const badge = getConfigBadge();

  return (
    <Card className="p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold text-xs flex-shrink-0">
            {index + 1}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm truncate">{passeggero.nome_cognome}</span>
              {passeggero.isNew && <Badge variant="secondary" className="text-xs">Nuovo</Badge>}
              <Badge variant={badge.variant} className="text-xs flex items-center gap-1">
                {badge.icon} {badge.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              {getPresaDisplay()}
            </p>
            {passeggero.orario_presa_personalizzato && (
              <p className="text-xs text-muted-foreground">
                Orario: {passeggero.orario_presa_personalizzato}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {totalCount > 1 && (
            <>
              <Button type="button" variant="ghost" size="sm" onClick={onMoveUp} disabled={index === 0} className="h-8 w-8 p-0">
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={onMoveDown} disabled={index === totalCount - 1} className="h-8 w-8 p-0">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={onConfigura} className="h-8 w-8 p-0">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
