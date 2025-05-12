
import { Card, CardContent } from "@/components/ui/card";
import { Passeggero } from "@/lib/types/servizi";
import { MapPin, Clock, Phone, Mail, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import { ServizioFormData } from "@/lib/types/servizi";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";

interface PasseggeroCardProps {
  passeggero?: Passeggero;
  servizioPresa?: string;
  servizioDestinazione?: string;
  servizioOrario?: string;
  // Props for form usage
  index?: number;
  onRemove?: () => void;
}

export const PasseggeroCard = ({
  passeggero,
  servizioPresa,
  servizioDestinazione,
  servizioOrario,
  index,
  onRemove
}: PasseggeroCardProps) => {
  // If this is being used as a form field component
  const { register, watch, setValue } = useFormContext<ServizioFormData>() || {};

  // If we're using this as a form field component
  if (typeof index === 'number' && onRemove && register) {
    const usaIndirizzoPersonalizzato = watch(`passeggeri.${index}.usa_indirizzo_personalizzato`);
    
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-medium">Passeggero {index + 1}</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onRemove}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Rimuovi</span>
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor={`passeggeri.${index}.nome_cognome`} className="block text-sm font-medium mb-1">
                Nome e cognome
              </label>
              <input
                {...register(`passeggeri.${index}.nome_cognome`)}
                className="w-full border rounded p-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor={`passeggeri.${index}.telefono`} className="block text-sm font-medium mb-1">
                  Telefono
                </label>
                <input
                  {...register(`passeggeri.${index}.telefono`)}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label htmlFor={`passeggeri.${index}.email`} className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  {...register(`passeggeri.${index}.email`)}
                  className="w-full border rounded p-2"
                />
              </div>
            </div>

            <FormField
              name={`passeggeri.${index}.usa_indirizzo_personalizzato`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        setValue(`passeggeri.${index}.usa_indirizzo_personalizzato`, !!checked);
                      }}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Questo passeggero ha indirizzi intermedi diversi
                  </FormLabel>
                </FormItem>
              )}
            />

            {usaIndirizzoPersonalizzato && (
              <div className="space-y-4 mt-4 p-3 bg-muted/50 rounded-md">
                <div>
                  <label htmlFor={`passeggeri.${index}.orario_presa_personalizzato`} className="block text-sm font-medium mb-1">
                    Orario di presa personalizzato
                  </label>
                  <input
                    type="time"
                    {...register(`passeggeri.${index}.orario_presa_personalizzato`)}
                    className="w-full border rounded p-2"
                  />
                </div>
                
                <div>
                  <label htmlFor={`passeggeri.${index}.luogo_presa_personalizzato`} className="block text-sm font-medium mb-1">
                    Indirizzo di presa intermedio
                  </label>
                  <input
                    {...register(`passeggeri.${index}.luogo_presa_personalizzato`)}
                    className="w-full border rounded p-2"
                    placeholder="Inserisci l'indirizzo intermedio di presa"
                  />
                </div>
                
                <div>
                  <label htmlFor={`passeggeri.${index}.destinazione_personalizzato`} className="block text-sm font-medium mb-1">
                    Destinazione intermedia
                  </label>
                  <input
                    {...register(`passeggeri.${index}.destinazione_personalizzato`)}
                    className="w-full border rounded p-2"
                    placeholder="Inserisci la destinazione intermedia"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Original view-only component
  if (!passeggero) return null;
  
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <div className="font-semibold">{passeggero.nome_cognome}</div>
        </div>
        
        {(passeggero.email || passeggero.telefono) && (
          <div className="space-y-1">
            {passeggero.telefono && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">{passeggero.telefono}</div>
              </div>
            )}
            {passeggero.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">{passeggero.email}</div>
              </div>
            )}
          </div>
        )}
        
        <div className="pt-1">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm font-medium">Orario di presa:</div>
            <div className="text-sm">
              {passeggero.orario_presa_personalizzato || servizioOrario}
              {passeggero.orario_presa_personalizzato && (
                <span className="text-xs text-muted-foreground ml-1">(intermedio)</span>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Luogo di presa:</div>
              <div className="text-sm">
                {passeggero.usa_indirizzo_personalizzato && passeggero.luogo_presa_personalizzato
                  ? passeggero.luogo_presa_personalizzato
                  : servizioPresa}
                {passeggero.usa_indirizzo_personalizzato && passeggero.luogo_presa_personalizzato && (
                  <span className="text-xs text-muted-foreground ml-1">(intermedio)</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {passeggero.usa_indirizzo_personalizzato && passeggero.destinazione_personalizzato && (
          <div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Destinazione:</div>
                <div className="text-sm">
                  {passeggero.destinazione_personalizzato}
                  <span className="text-xs text-muted-foreground ml-1">(intermedio)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
