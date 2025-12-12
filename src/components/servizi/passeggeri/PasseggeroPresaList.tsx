import { useFormContext } from "react-hook-form";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { PasseggeroPresaCard, PasseggeroPresaData } from "./PasseggeroPresaCard";
import { Users } from "lucide-react";

interface PasseggeroPresaListProps {
  fields: any[];  // ✅ Da props (single source of truth)
  remove: (index: number) => void;  // ✅ Da props
  move: (from: number, to: number) => void;  // ✅ Da props
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
  const { setValue, getValues } = useFormContext();

  // Debug log
  console.log('[PasseggeroPresaList] 🔄 Render:', fields.length, 'passeggeri');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id || `temp-${fields.indexOf(f as any)}` === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id || `temp-${fields.indexOf(f as any)}` === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        move(oldIndex, newIndex);
        
        // Ricalcola ordini dopo il movimento
        const passeggeri = getValues("passeggeri");
        passeggeri.forEach((_: any, idx: number) => {
          setValue(`passeggeri.${idx}.ordine`, idx + 1);
          
          // Se il primo passeggero cambia, resetta l'uso orario servizio
          if (idx === 0) {
            setValue(`passeggeri.${idx}.presa_usa_orario_servizio`, true);
          }
        });
      }
    }
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

  const sortableIds = fields.map((f, idx) => f.id || `temp-${idx}`);

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
          <span className="inline-block w-5 h-5 rounded bg-muted flex items-center justify-center">
            <span className="text-[10px]">⠿</span>
          </span>
          Trascina per riordinare la sequenza di pick-up
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <PasseggeroPresaCard
                key={field.id}
                index={index}
                orarioServizio={orarioServizio}
                indirizzoServizio={indirizzoServizio}
                cittaServizio={cittaServizio}
                destinazioneServizio={destinazioneServizio}
                cittaDestinazioneServizio={cittaDestinazioneServizio}
                isFirst={index === 0}
                onRemove={() => remove(index)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
