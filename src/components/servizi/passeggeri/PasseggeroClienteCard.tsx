import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, ChevronUp, ChevronDown, MapPin, Home, Users, Clock, Navigation } from "lucide-react";

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

interface PasseggeroClienteCardProps {
  passeggero: PasseggeroClienteData;
  index: number;
  totalCount?: number;
  primoPasseggero?: PasseggeroClienteData;
  orarioServizio?: string;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onChange: (updatedPasseggero: PasseggeroClienteData) => void;
}

export const PasseggeroClienteCard = ({
  passeggero,
  index,
  totalCount = 1,
  primoPasseggero,
  orarioServizio = '',
  onRemove,
  onMoveUp,
  onMoveDown,
  onChange,
}: PasseggeroClienteCardProps) => {
  const hasIndirizzo = !!(passeggero.indirizzo || passeggero.localita);
  const presaTipo = passeggero._presa_tipo || 'personalizzato';
  const destinazioneTipo = passeggero._destinazione_tipo || 'personalizzato';

  const handlePresaTipoChange = (value: string) => {
    const updated: PasseggeroClienteData = { ...passeggero, _presa_tipo: value as PasseggeroClienteData['_presa_tipo'] };
    if (value === 'primo_passeggero' && primoPasseggero) {
      updated._usa_orario_servizio = primoPasseggero._usa_orario_servizio;
      updated.orario_presa_personalizzato = primoPasseggero.orario_presa_personalizzato;
    }
    onChange(updated);
  };

  const handleDestinazioneTipoChange = (value: string) => {
    const updated: PasseggeroClienteData = { ...passeggero, _destinazione_tipo: value as PasseggeroClienteData['_destinazione_tipo'] };
    onChange(updated);
  };

  // Build presa options
  const presaOptions: { value: string; label: string; sublabel?: string; icon: React.ReactNode }[] = [];
  if (index > 0 && primoPasseggero) {
    presaOptions.push({
      value: 'primo_passeggero',
      label: `Stesso del primo (${primoPasseggero.nome_cognome})`,
      sublabel: getIndirizzoPresaPrimo(primoPasseggero),
      icon: <Users className="h-3.5 w-3.5" />,
    });
  }
  if (hasIndirizzo) {
    presaOptions.push({
      value: 'passeggero',
      label: 'Indirizzo passeggero',
      sublabel: [passeggero.indirizzo, passeggero.localita].filter(Boolean).join(", "),
      icon: <Home className="h-3.5 w-3.5" />,
    });
  }
  presaOptions.push({
    value: 'personalizzato',
    label: 'Altro indirizzo...',
    icon: <MapPin className="h-3.5 w-3.5" />,
  });

  // Build destinazione options
  const destOptions: { value: string; label: string; sublabel?: string; icon: React.ReactNode }[] = [];
  if (index > 0 && primoPasseggero) {
    destOptions.push({
      value: 'primo_passeggero',
      label: `Stesso del primo (${primoPasseggero.nome_cognome})`,
      sublabel: getIndirizzoDestinazionePrimo(primoPasseggero),
      icon: <Users className="h-3.5 w-3.5" />,
    });
  }
  if (hasIndirizzo) {
    destOptions.push({
      value: 'passeggero',
      label: 'Indirizzo passeggero',
      sublabel: [passeggero.indirizzo, passeggero.localita].filter(Boolean).join(", "),
      icon: <Home className="h-3.5 w-3.5" />,
    });
  }
  destOptions.push({
    value: 'personalizzato',
    label: 'Altro indirizzo...',
    icon: <MapPin className="h-3.5 w-3.5" />,
  });

  return (
    <Card className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold text-xs flex-shrink-0">
            {index + 1}
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-medium text-sm truncate block">{passeggero.nome_cognome}</span>
            <span className="text-xs text-muted-foreground">Ordine pick-up: #{index + 1}</span>
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
          <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Punto di presa */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5 text-muted-foreground">
          <Navigation className="h-3.5 w-3.5" />
          Punto di presa
        </Label>
        <Select value={presaTipo} onValueChange={handlePresaTipoChange}>
          <SelectTrigger className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {presaOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                <div className="flex items-center gap-2">
                  {opt.icon}
                  <span>{opt.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Preview "Stesso del primo" */}
        {presaTipo === 'primo_passeggero' && primoPasseggero && (
          <div className="rounded-md bg-muted/50 p-3 text-sm space-y-1">
            <p className="flex items-center gap-1.5 text-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              {getIndirizzoPresaPrimo(primoPasseggero)}
            </p>
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              Orario: {primoPasseggero._usa_orario_servizio
                ? `${orarioServizio} (orario servizio)`
                : primoPasseggero.orario_presa_personalizzato || 'Non specificato'}
            </p>
          </div>
        )}

        {/* Preview indirizzo passeggero */}
        {presaTipo === 'passeggero' && hasIndirizzo && (
          <div className="rounded-md bg-muted/50 p-3 text-sm">
            <p className="flex items-center gap-1.5 text-foreground">
              <Home className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              {[passeggero.indirizzo, passeggero.localita].filter(Boolean).join(", ")}
            </p>
          </div>
        )}

        {/* Campi personalizzato */}
        {presaTipo === 'personalizzato' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input
              placeholder="Città"
              value={passeggero.localita_presa_personalizzato || ''}
              onChange={(e) => onChange({ ...passeggero, localita_presa_personalizzato: e.target.value })}
              className="h-9"
            />
            <Input
              placeholder="Via, numero civico *"
              value={passeggero.luogo_presa_personalizzato || ''}
              onChange={(e) => onChange({ ...passeggero, luogo_presa_personalizzato: e.target.value })}
              className="h-9"
            />
          </div>
        )}
      </div>

      {/* Orario presa - nascosto per "primo_passeggero" */}
      {presaTipo !== 'primo_passeggero' && (
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Orario presa
          </Label>
          {index === 0 ? (
            <div className="flex items-center gap-2">
              <Checkbox
                id={`usa-orario-${index}`}
                checked={passeggero._usa_orario_servizio ?? true}
                onCheckedChange={(checked) => onChange({ ...passeggero, _usa_orario_servizio: checked === true })}
              />
              <Label htmlFor={`usa-orario-${index}`} className="text-sm font-normal cursor-pointer">
                Usa orario servizio ({orarioServizio})
              </Label>
            </div>
          ) : null}
          {!(passeggero._usa_orario_servizio && index === 0) && (
            <Input
              type="time"
              value={passeggero.orario_presa_personalizzato || ''}
              onChange={(e) => onChange({ ...passeggero, orario_presa_personalizzato: e.target.value })}
              className="h-9 w-full sm:w-40"
            />
          )}
        </div>
      )}

      {/* Punto di destinazione */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          Punto di destinazione
        </Label>
        <Select value={destinazioneTipo} onValueChange={handleDestinazioneTipoChange}>
          <SelectTrigger className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {destOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                <div className="flex items-center gap-2">
                  {opt.icon}
                  <span>{opt.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Preview "Stesso del primo" */}
        {destinazioneTipo === 'primo_passeggero' && primoPasseggero && (
          <div className="rounded-md bg-muted/50 p-3 text-sm">
            <p className="flex items-center gap-1.5 text-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              {getIndirizzoDestinazionePrimo(primoPasseggero)}
            </p>
          </div>
        )}

        {/* Preview indirizzo passeggero */}
        {destinazioneTipo === 'passeggero' && hasIndirizzo && (
          <div className="rounded-md bg-muted/50 p-3 text-sm">
            <p className="flex items-center gap-1.5 text-foreground">
              <Home className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              {[passeggero.indirizzo, passeggero.localita].filter(Boolean).join(", ")}
            </p>
          </div>
        )}

        {/* Campi personalizzato destinazione */}
        {destinazioneTipo === 'personalizzato' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input
              placeholder="Città"
              value={passeggero.localita_destinazione_personalizzato || ''}
              onChange={(e) => onChange({ ...passeggero, localita_destinazione_personalizzato: e.target.value })}
              className="h-9"
            />
            <Input
              placeholder="Via, numero civico *"
              value={passeggero.destinazione_personalizzato || ''}
              onChange={(e) => onChange({ ...passeggero, destinazione_personalizzato: e.target.value })}
              className="h-9"
            />
          </div>
        )}
      </div>
    </Card>
  );
};
