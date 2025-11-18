import { useFormContext, useWatch } from "react-hook-form";
import { ServizioFormData } from "@/lib/types/servizi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, MapPin, MapPinned, Pencil, Trash2 } from "lucide-react";
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

interface PasseggeroCompactCardProps {
  index: number;
  onEdit: () => void;
  onRemove: () => void;
}

export const PasseggeroCompactCard = ({ index, onEdit, onRemove }: PasseggeroCompactCardProps) => {
  const { control } = useFormContext<ServizioFormData>();
  const passeggero = useWatch({ control, name: `passeggeri.${index}` });
  
  if (!passeggero) return null;
  
  const nome = passeggero.nome || '';
  const cognome = passeggero.cognome || '';
  const nomeCompleto = `${nome} ${cognome}`.trim() || `Passeggero ${index + 1}`;
  
  return (
    <Card className="p-4 space-y-2 hover:bg-accent/50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <span className="font-medium truncate">{nomeCompleto}</span>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4" />
          </Button>
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
      </div>
      
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
        {passeggero.email && (
          <div className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            <span className="truncate">{passeggero.email}</span>
          </div>
        )}
        {passeggero.telefono && (
          <div className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" />
            <span>{passeggero.telefono}</span>
          </div>
        )}
      </div>
      
      {(passeggero.localita || passeggero.indirizzo) && (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">
            {[passeggero.localita, passeggero.indirizzo]
              .filter(Boolean)
              .join(', ')}
          </span>
        </div>
      )}
      
      {passeggero.usa_indirizzo_personalizzato && passeggero.luogo_presa_personalizzato && (
        <div className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-500">
          <MapPinned className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">Presa: {passeggero.luogo_presa_personalizzato}</span>
        </div>
      )}
      
      {passeggero.usa_indirizzo_personalizzato && passeggero.destinazione_personalizzato && (
        <div className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-500">
          <MapPinned className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">Dest: {passeggero.destinazione_personalizzato}</span>
        </div>
      )}
    </Card>
  );
};
