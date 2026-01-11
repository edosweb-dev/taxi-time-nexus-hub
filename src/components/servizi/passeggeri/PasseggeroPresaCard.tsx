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
import { ChevronUp, ChevronDown, Trash2, MapPin, Clock, Navigation } from "lucide-react";
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
  indirizzo_rubrica?: string;
  localita_rubrica?: string;
  email?: string;
  telefono?: string;
  ordine: number;
  presa_tipo: 'servizio' | 'passeggero' | 'personalizzato';
  presa_indirizzo_custom: string;
  presa_citta_custom: string;
  presa_orario: string;
  presa_usa_orario_servizio: boolean;
  destinazione_tipo: 'servizio' | 'passeggero' | 'personalizzato';
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
}

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
}: PasseggeroPresaCardProps) => {
  const { control, setValue } = useFormContext();
  const passeggero = useWatch({ control, name: `passeggeri.${index}` });

  if (!passeggero) return null;

  const nome = passeggero.nome || '';
  const cognome = passeggero.cognome || '';
  const nomeCompleto = `${nome} ${cognome}`.trim() || passeggero.nome_cognome || `Passeggero ${index + 1}`;
  const hasIndirizzoRubrica = Boolean(passeggero.indirizzo_rubrica || passeggero.indirizzo || passeggero.localita);
  const indirizzoRubricaDisplay = [passeggero.indirizzo || passeggero.indirizzo_rubrica, passeggero.localita || passeggero.localita_rubrica].filter(Boolean).join(', ');
  const indirizzoServizioDisplay = [indirizzoServizio, cittaServizio].filter(Boolean).join(', ');
  const destinazioneServizioDisplay = [destinazioneServizio, cittaDestinazioneServizio].filter(Boolean).join(', ');

  return (
    <Card className="p-4 space-y-4">
      {/* Header con frecce su/giù */}
      <div className="flex items-center gap-3">
        {/* Frecce su/giù */}
        {totalCount > 1 && (
          <div className="flex flex-col gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMoveUp();
              }}
              disabled={index === 0}
              title="Sposta su"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMoveDown();
              }}
              disabled={index === totalCount - 1}
              title="Sposta giù"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Numero ordine */}
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex-shrink-0">
          {index + 1}
        </div>
        
        {/* Nome passeggero */}
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{nomeCompleto}</div>
          <div className="text-xs text-muted-foreground">
            Ordine pick-up: #{index + 1}
          </div>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
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
          defaultValue={hasIndirizzoRubrica ? "passeggero" : "servizio"}
          render={({ field }) => (
            <Select value={field.value || 'servizio'} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleziona punto di presa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="servizio">
                  <span className="flex flex-col items-start">
                    <span>Partenza servizio</span>
                    {indirizzoServizioDisplay && (
                      <span className="text-xs text-muted-foreground">({indirizzoServizioDisplay})</span>
                    )}
                  </span>
                </SelectItem>
                {hasIndirizzoRubrica && (
                  <SelectItem value="passeggero">
                    <span className="flex flex-col items-start">
                      <span>Indirizzo passeggero</span>
                      <span className="text-xs text-muted-foreground">({indirizzoRubricaDisplay})</span>
                    </span>
                  </SelectItem>
                )}
                <SelectItem value="personalizzato">
                  Altro indirizzo...
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

        {/* Orario presa */}
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
                  <Input {...field} type="time" className="w-32" required />
                  <p className="text-xs text-muted-foreground">
                    Orario obbligatorio per passeggeri successivi
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
          defaultValue="servizio"
          render={({ field }) => (
            <Select value={field.value || 'servizio'} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleziona destinazione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="servizio">
                  <span className="flex flex-col items-start">
                    <span>Destinazione servizio</span>
                    {destinazioneServizioDisplay && (
                      <span className="text-xs text-muted-foreground">({destinazioneServizioDisplay})</span>
                    )}
                  </span>
                </SelectItem>
                {hasIndirizzoRubrica && (
                  <SelectItem value="passeggero">
                    <span className="flex flex-col items-start">
                      <span>Indirizzo passeggero</span>
                      <span className="text-xs text-muted-foreground">({indirizzoRubricaDisplay})</span>
                    </span>
                  </SelectItem>
                )}
                <SelectItem value="personalizzato">
                  Altro indirizzo...
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
      </div>
    </Card>
  );
};
