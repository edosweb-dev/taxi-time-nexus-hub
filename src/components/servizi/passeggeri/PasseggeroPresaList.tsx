import { useFormContext, useWatch } from "react-hook-form";
import { PasseggeroPresaCard } from "./PasseggeroPresaCard";
import { Users } from "lucide-react";

interface PasseggeroPresaListProps {
  fields: any[];
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  orarioServizio: string;
  indirizzoServizio: string;
  cittaServizio?: string;
  destinazioneServizio: string;
  cittaDestinazioneServizio?: string;
}

export const PasseggeroPresaList = ({
  fields,
  remove,
  move,
  orarioServizio,
  indirizzoServizio,
  cittaServizio,
  destinazioneServizio,
  cittaDestinazioneServizio,
}: PasseggeroPresaListProps) => {
  const { setValue, getValues, control } = useFormContext();

  // Watch primo passeggero per passare dati aggiornati ai successivi
  const primoPasseggero = useWatch({ control, name: 'passeggeri.0' });

  // Handler per spostare passeggero su/giù
  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= fields.length) return;

    move(fromIndex, toIndex);

    // Ricalcola ordini dopo il movimento
    const passeggeri = getValues("passeggeri");
    passeggeri?.forEach((_: any, idx: number) => {
      setValue(`passeggeri.${idx}.ordine`, idx + 1);
      if (idx === 0) {
        setValue(`passeggeri.${idx}.presa_usa_orario_servizio`, true);
      }
    });
  };

  if (fields.length === 0) {
    return (
      <div className="text-center py-8 rounded-lg border-2 border-dashed bg-muted/5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted/50 mb-3">
          <Users className="h-5 w-5 text-muted-foreground/70" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">
          Nessun passeggero aggiunto
        </p>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          Seleziona dall'elenco sopra o crea un nuovo passeggero
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Percorso passeggeri ({fields.length})
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
      
      {fields.length > 1 && (
        <div className="text-xs text-muted-foreground text-center pb-1 flex items-center justify-center gap-2">
          <span className="inline-block">
            Usa le frecce ▲▼ per riordinare la sequenza di pick-up
          </span>
        </div>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <PasseggeroPresaCard
            key={field.id}
            index={index}
            totalCount={fields.length}
            onMoveUp={() => handleMove(index, index - 1)}
            onMoveDown={() => handleMove(index, index + 1)}
            orarioServizio={orarioServizio}
            indirizzoServizio={indirizzoServizio}
            cittaServizio={cittaServizio}
            destinazioneServizio={destinazioneServizio}
            cittaDestinazioneServizio={cittaDestinazioneServizio}
            isFirst={index === 0}
            onRemove={() => remove(index)}
            primoPasseggero={index > 0 ? primoPasseggero : undefined}
          />
        ))}
      </div>
    </div>
  );
};
