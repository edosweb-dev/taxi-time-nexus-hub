import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useFormContext, useWatch, Controller } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { GripVertical, Trash2, MapPin, Clock, Navigation } from "lucide-react";
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
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: passeggero?.id || `temp-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (!passeggero) return null;

  const nome = passeggero.nome || '';
  const cognome = passeggero.cognome || '';
  const nomeCompleto = `${nome} ${cognome}`.trim() || passeggero.nome_cognome || `Passeggero ${index + 1}`;
  const hasIndirizzoRubrica = Boolean(passeggero.indirizzo_rubrica || passeggero.indirizzo || passeggero.localita);
  const indirizzoRubricaDisplay = [passeggero.indirizzo || passeggero.indirizzo_rubrica, passeggero.localita || passeggero.localita_rubrica].filter(Boolean).join(', ');
  const indirizzoServizioDisplay = [indirizzoServizio, cittaServizio].filter(Boolean).join(', ');
  const destinazioneServizioDisplay = [destinazioneServizio, cittaDestinazioneServizio].filter(Boolean).join(', ');

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-4 space-y-4 ${isDragging ? 'shadow-lg ring-2 ring-primary' : ''}`}
    >
      {/* Header con drag handle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>
        
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
          defaultValue="servizio"
          render={({ field }) => (
            <RadioGroup
              value={field.value || 'servizio'}
              onValueChange={field.onChange}
              className="space-y-2"
            >
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="servizio" id={`presa-servizio-${index}`} className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor={`presa-servizio-${index}`} className="font-normal cursor-pointer">
                    Partenza servizio
                  </Label>
                  {indirizzoServizioDisplay && (
                    <p className="text-xs text-muted-foreground mt-0.5">{indirizzoServizioDisplay}</p>
                  )}
                </div>
              </div>
              
              {hasIndirizzoRubrica && (
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="passeggero" id={`presa-passeggero-${index}`} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={`presa-passeggero-${index}`} className="font-normal cursor-pointer">
                      Indirizzo passeggero
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">{indirizzoRubricaDisplay}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="personalizzato" id={`presa-custom-${index}`} className="mt-1" />
                <Label htmlFor={`presa-custom-${index}`} className="font-normal cursor-pointer">
                  Indirizzo personalizzato
                </Label>
              </div>
            </RadioGroup>
          )}
        />

        {/* Campi indirizzo personalizzato presa */}
        {passeggero.presa_tipo === 'personalizzato' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
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
            <RadioGroup
              value={field.value || 'servizio'}
              onValueChange={field.onChange}
              className="space-y-2"
            >
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="servizio" id={`dest-servizio-${index}`} className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor={`dest-servizio-${index}`} className="font-normal cursor-pointer">
                    Destinazione servizio
                  </Label>
                  {destinazioneServizioDisplay && (
                    <p className="text-xs text-muted-foreground mt-0.5">{destinazioneServizioDisplay}</p>
                  )}
                </div>
              </div>
              
              {hasIndirizzoRubrica && (
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="passeggero" id={`dest-passeggero-${index}`} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={`dest-passeggero-${index}`} className="font-normal cursor-pointer">
                      Indirizzo passeggero
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">{indirizzoRubricaDisplay}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="personalizzato" id={`dest-custom-${index}`} className="mt-1" />
                <Label htmlFor={`dest-custom-${index}`} className="font-normal cursor-pointer">
                  Indirizzo personalizzato
                </Label>
              </div>
            </RadioGroup>
          )}
        />

        {/* Campi indirizzo personalizzato destinazione */}
        {passeggero.destinazione_tipo === 'personalizzato' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
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
