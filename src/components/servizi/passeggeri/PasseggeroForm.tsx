
import React from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ServizioFormData } from "@/lib/types/servizi";
import { PasseggeroCard } from "./PasseggeroCard";
import { PasseggeroSelector } from "./PasseggeroSelector";
import { PasseggeriList } from "./PasseggeriList";

export function PasseggeroForm({ userRole }: { userRole?: string }) {
  const { control, setValue } = useFormContext<ServizioFormData>();
  
  // Watch per azienda_id e referente_id
  const azienda_id = useWatch({ control, name: "azienda_id" });
  const referente_id = useWatch({ control, name: "referente_id" });
  
  // Utilizziamo useFieldArray per gestire l'array dinamico di passeggeri
  const { fields, append, remove } = useFieldArray({
    control,
    name: "passeggeri",
  });

  // Aggiungi un passeggero dal selector
  const handlePasseggeroSelect = (passeggero: any) => {
    const currentIndex = fields.length;
    append(passeggero);
    
    // Assicuriamoci che tutti i campi siano popolati correttamente
    setTimeout(() => {
      setValue(`passeggeri.${currentIndex}.nome`, passeggero.nome || '');
      setValue(`passeggeri.${currentIndex}.cognome`, passeggero.cognome || '');
      setValue(`passeggeri.${currentIndex}.localita`, passeggero.localita || '');
      setValue(`passeggeri.${currentIndex}.indirizzo`, passeggero.indirizzo || '');
      setValue(`passeggeri.${currentIndex}.telefono`, passeggero.telefono || '');
      setValue(`passeggeri.${currentIndex}.email`, passeggero.email || '');
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header con CTA per visualizzare tutti i passeggeri */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm">
            Seleziona e configura i passeggeri per questo servizio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PasseggeriList userRole={userRole} />
          <div className="text-sm text-muted-foreground">
            {fields.length} passeggero{fields.length !== 1 ? 'i' : ''} aggiunto{fields.length !== 1 ? 'i' : ''}
          </div>
        </div>
      </div>

      {/* Passenger Selector */}
      <div className="bg-muted/30 border-2 border-dashed rounded-lg p-6">
        <PasseggeroSelector
          azienda_id={azienda_id}
          referente_id={referente_id}
          onPasseggeroSelect={handlePasseggeroSelect}
        />
      </div>

      {/* Selected Passengers List */}
      {fields.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 border rounded-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <PlusCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Nessun passeggero aggiunto</h3>
          <p className="text-muted-foreground mb-4">
            Utilizza il selettore sopra per aggiungere passeggeri al servizio
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Passeggeri del servizio</h3>
            <div className="text-sm text-muted-foreground">
              {fields.length} di ∞ passeggeri
            </div>
          </div>
          <div className="grid gap-4">
            {fields.map((field, index) => (
              <PasseggeroCard 
                key={field.id}
                index={index} 
                onRemove={() => remove(index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
