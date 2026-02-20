import { useFormContext, useWatch, Controller } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronUp, ChevronDown, Trash2, MapPin, Clock, Navigation, Users, Home } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface PasseggeroPresaData {
  id?: string;
  passeggero_id?: string;
  nome_cognome: string;
  nome?: string;
  cognome?: string;
  indirizzo?: string;
  localita?: string;
  indirizzo_rubrica?: string;
  localita_rubrica?: string;
  email?: string;
  telefono?: string;
  ordine: number;
  presa_tipo: 'servizio' | 'passeggero' | 'personalizzato' | 'primo_passeggero';
  presa_indirizzo_custom: string;
  presa_citta_custom: string;
  presa_orario: string;
  presa_usa_orario_servizio: boolean;
  destinazione_tipo: 'servizio' | 'passeggero' | 'personalizzato' | 'primo_passeggero';
  destinazione_indirizzo_custom: string;
  destinazione_citta_custom: string;
}

interface PasseggeroPresaCardProps {
  index: number;
  totalCount: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  orarioServizio: string;
  indirizzoServizio: string;
  cittaServizio?: string;
  destinazioneServizio: string;
  cittaDestinazioneServizio?: string;
  isFirst: boolean;
  onRemove: () => void;
  primoPasseggero?: PasseggeroPresaData;
}

// Helper: indirizzo presa del primo passeggero
const getIndirizzoPresaPrimo = (primo: PasseggeroPresaData): string => {
  if (primo.presa_tipo === 'personalizzato') {
    return primo.presa_indirizzo_custom
      ? [primo.presa_indirizzo_custom, primo.presa_citta_custom].filter(Boolean).join(', ')
      : 'Non specificato';
  }
  if (primo.presa_tipo === 'passeggero') {
    const addr = primo.indirizzo_rubrica || primo.indirizzo || '';
    const loc = primo.localita_rubrica || primo.localita || '';
    return addr ? [addr, loc].filter(Boolean).join(', ') : 'Non specificato';
  }
  return 'Non specificato';
};

// Helper: indirizzo destinazione del primo passeggero
const getIndirizzoDestinazionePrimo = (primo: PasseggeroPresaData): string => {
  if (primo.destinazione_tipo === 'personalizzato') {
    return primo.destinazione_indirizzo_custom
      ? [primo.destinazione_indirizzo_custom, primo.destinazione_citta_custom].filter(Boolean).join(', ')
      : 'Non specificato';
  }
  if (primo.destinazione_tipo === 'passeggero') {
    const addr = primo.indirizzo_rubrica || primo.indirizzo || '';
    const loc = primo.localita_rubrica || primo.localita || '';
    return addr ? [addr, loc].filter(Boolean).join(', ') : 'Non specificato';
  }
  return 'Non specificato';
};

export const PasseggeroPresaCard = ({
  index,
  totalCount,
  onMoveUp,
  onMoveDown,
  orarioServizio,
  indirizzoServizio,
  cittaServizio,
  destinazioneServizio,
  cittaDestinazioneServizio,
  isFirst,
  onRemove,
  primoPasseggero,
}: PasseggeroPresaCardProps) => {
  const { control, setValue } = useFormContext();
  const passeggero = useWatch({ control, name: `passeggeri.${index}` });

  if (!passeggero) return null;

  const nome = passeggero.nome || '';
  const cognome = passeggero.cognome || '';
  const nomeCompleto = `${nome} ${cognome}`.trim() || passeggero.nome_cognome || `Passeggero ${index + 1}`;
  const hasIndirizzoRubrica = Boolean(passeggero.indirizzo_rubrica || passeggero.indirizzo || passeggero.localita);
  const indirizzoRubricaDisplay = [passeggero.indirizzo || passeggero.indirizzo_rubrica, passeggero.localita || passeggero.localita_rubrica].filter(Boolean).join(', ');

  const primoNome = primoPasseggero
    ? (`${primoPasseggero.nome || ''} ${primoPasseggero.cognome || ''}`.trim() || primoPasseggero.nome_cognome || 'Passeggero 1')
    : 'Passeggero 1';

  return (
    <Card className="p-4 space-y-4">
      {/* Header con frecce su/giù */}
      <div className="flex items-center gap-3">
        {totalCount > 1 && (
          <div className="flex flex-col gap-0.5">
            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 p-0"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMoveUp(); }}
              disabled={index === 0} title="Sposta su">
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 p-0"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMoveDown(); }}
              disabled={index === totalCount - 1} title="Sposta giù">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex-shrink-0">
          {index + 1}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{nomeCompleto}</div>
          <div className="text-xs text-muted-foreground">
            Ordine pick-up: #{index + 1}
          </div>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
              <AlertDialogDescription>
                Sei sicuro di voler rimuovere {nomeCompleto} dalla lista passeggeri?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction onClick={onRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Elimina
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Sezione PRESA */}
      <div className="space-y-3 border-t pt-4">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <MapPin className="h-4 w-4" />
          Punto di presa
        </div>
        
        <Controller
          control={control}
          name={`passeggeri.${index}.presa_tipo`}
          defaultValue={hasIndirizzoRubrica ? "passeggero" : "personalizzato"}
          render={({ field }) => (
            <Select 
              value={field.value || 'personalizzato'} 
              onValueChange={(val) => {
                field.onChange(val);
                // Se "Stesso del primo", copia dati
                if (val === 'primo_passeggero' && primoPasseggero) {
                  if (primoPasseggero.presa_tipo === 'personalizzato') {
                    setValue(`passeggeri.${index}.presa_indirizzo_custom`, primoPasseggero.presa_indirizzo_custom || '');
                    setValue(`passeggeri.${index}.presa_citta_custom`, primoPasseggero.presa_citta_custom || '');
                  }
                  // Copia impostazioni orario dal primo
                  setValue(`passeggeri.${index}.presa_usa_orario_servizio`, primoPasseggero.presa_usa_orario_servizio);
                  if (!primoPasseggero.presa_usa_orario_servizio) {
                    setValue(`passeggeri.${index}.presa_orario`, primoPasseggero.presa_orario || '');
                  }
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleziona punto di presa" />
              </SelectTrigger>
              <SelectContent>
                {/* Stesso del primo - solo per passeggeri successivi */}
                {index > 0 && primoPasseggero && (
                  <SelectItem value="primo_passeggero">
                    <span className="flex flex-col items-start">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        Stesso del primo ({primoNome})
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {getIndirizzoPresaPrimo(primoPasseggero)}
                      </span>
                    </span>
                  </SelectItem>
                )}
                
                {/* Indirizzo passeggero dalla rubrica */}
                {hasIndirizzoRubrica && (
                  <SelectItem value="passeggero">
                    <span className="flex flex-col items-start">
                      <span className="flex items-center gap-1.5">
                        <Home className="h-3.5 w-3.5" />
                        Indirizzo passeggero
                      </span>
                      <span className="text-xs text-muted-foreground">({indirizzoRubricaDisplay})</span>
                    </span>
                  </SelectItem>
                )}
                
                {/* Personalizzato */}
                <SelectItem value="personalizzato">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    Altro indirizzo...
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        />

        {/* Campi indirizzo personalizzato presa */}
        {passeggero.presa_tipo === 'personalizzato' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Indirizzo</Label>
              <Controller
                control={control}
                name={`passeggeri.${index}.presa_indirizzo_custom`}
                defaultValue=""
                render={({ field }) => (
                  <Input {...field} placeholder="Via, numero civico" className="mt-1" />
                )}
              />
            </div>
            <div>
              <Label className="text-xs">Città</Label>
              <Controller
                control={control}
                name={`passeggeri.${index}.presa_citta_custom`}
                defaultValue=""
                render={({ field }) => (
                  <Input {...field} placeholder="Città" className="mt-1" />
                )}
              />
            </div>
          </div>
        )}

        {/* Preview per "Stesso del primo" */}
        {passeggero.presa_tipo === 'primo_passeggero' && primoPasseggero && (
          <div className="text-sm text-muted-foreground pl-4 border-l-2 border-primary/30">
            📍 {getIndirizzoPresaPrimo(primoPasseggero)}
          </div>
        )}

        {/* Orario presa - SEMPRE visibile */}
        <div className="flex items-center gap-2 pt-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Orario presa</span>
        </div>
        
        {isFirst ? (
          <div className="space-y-2 pl-6">
            <Controller
              control={control}
              name={`passeggeri.${index}.presa_usa_orario_servizio`}
              defaultValue={true}
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`usa-orario-${index}`}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor={`usa-orario-${index}`} className="font-normal text-sm cursor-pointer">
                    Usa orario servizio ({orarioServizio || 'non impostato'})
                  </Label>
                </div>
              )}
            />
            
            {!passeggero.presa_usa_orario_servizio && (
              <Controller
                control={control}
                name={`passeggeri.${index}.presa_orario`}
                defaultValue=""
                render={({ field }) => (
                  <Input {...field} type="time" className="w-32" />
                )}
              />
            )}
          </div>
        ) : (
          <div className="pl-6">
            <Controller
              control={control}
              name={`passeggeri.${index}.presa_orario`}
              defaultValue=""
              render={({ field }) => (
                <div className="space-y-1">
                  <Input 
                    {...field} 
                    type="time" 
                    className="w-32" 
                    placeholder={orarioServizio || ''}
                  />
                  <p className="text-xs text-muted-foreground">
                    {field.value ? 'Orario personalizzato' : `Se vuoto, usa orario servizio (${orarioServizio || 'non impostato'})`}
                  </p>
                </div>
              )}
            />
          </div>
        )}
      </div>

      {/* Sezione DESTINAZIONE */}
      <div className="space-y-3 border-t pt-4">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Navigation className="h-4 w-4" />
          Punto di destinazione
        </div>
        
        <Controller
          control={control}
          name={`passeggeri.${index}.destinazione_tipo`}
          defaultValue="personalizzato"
          render={({ field }) => (
            <Select 
              value={field.value || 'personalizzato'} 
              onValueChange={(val) => {
                field.onChange(val);
                // Se "Stesso del primo", copia dati
                if (val === 'primo_passeggero' && primoPasseggero) {
                  if (primoPasseggero.destinazione_tipo === 'personalizzato') {
                    setValue(`passeggeri.${index}.destinazione_indirizzo_custom`, primoPasseggero.destinazione_indirizzo_custom || '');
                    setValue(`passeggeri.${index}.destinazione_citta_custom`, primoPasseggero.destinazione_citta_custom || '');
                  }
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleziona destinazione" />
              </SelectTrigger>
              <SelectContent>
                {/* Stesso del primo - solo per passeggeri successivi */}
                {index > 0 && primoPasseggero && (
                  <SelectItem value="primo_passeggero">
                    <span className="flex flex-col items-start">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        Stesso del primo ({primoNome})
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {getIndirizzoDestinazionePrimo(primoPasseggero)}
                      </span>
                    </span>
                  </SelectItem>
                )}
                
                {/* Indirizzo passeggero */}
                {hasIndirizzoRubrica && (
                  <SelectItem value="passeggero">
                    <span className="flex flex-col items-start">
                      <span className="flex items-center gap-1.5">
                        <Home className="h-3.5 w-3.5" />
                        Indirizzo passeggero
                      </span>
                      <span className="text-xs text-muted-foreground">({indirizzoRubricaDisplay})</span>
                    </span>
                  </SelectItem>
                )}
                
                {/* Personalizzato */}
                <SelectItem value="personalizzato">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    Altro indirizzo...
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        />

        {/* Campi indirizzo personalizzato destinazione */}
        {passeggero.destinazione_tipo === 'personalizzato' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Indirizzo</Label>
              <Controller
                control={control}
                name={`passeggeri.${index}.destinazione_indirizzo_custom`}
                defaultValue=""
                render={({ field }) => (
                  <Input {...field} placeholder="Via, numero civico" className="mt-1" />
                )}
              />
            </div>
            <div>
              <Label className="text-xs">Città</Label>
              <Controller
                control={control}
                name={`passeggeri.${index}.destinazione_citta_custom`}
                defaultValue=""
                render={({ field }) => (
                  <Input {...field} placeholder="Città" className="mt-1" />
                )}
              />
            </div>
          </div>
        )}

        {/* Preview per "Stesso del primo" */}
        {passeggero.destinazione_tipo === 'primo_passeggero' && primoPasseggero && (
          <div className="text-sm text-muted-foreground pl-4 border-l-2 border-primary/30">
            📍 {getIndirizzoDestinazionePrimo(primoPasseggero)}
          </div>
        )}
      </div>
    </Card>
  );
};
