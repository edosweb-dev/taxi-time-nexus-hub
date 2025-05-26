
import React from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ServizioFormData } from "@/lib/types/servizi";
import { PasseggeroCard } from "./PasseggeroCard";
import { PasseggeroSelector } from "./PasseggeroSelector";

export function PasseggeroForm() {
  const { control } = useFormContext<ServizioFormData>();
  
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
    append(passeggero);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Passeggeri</h2>
      </div>

      {/* Selector per aggiungere passeggeri */}
      <PasseggeroSelector
        azienda_id={azienda_id}
        referente_id={referente_id}
        onPasseggeroSelect={handlePasseggeroSelect}
      />

      {/* Lista passeggeri selezionati */}
      {fields.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center text-muted-foreground">
            Nessun passeggero aggiunto. Utilizza il selettore sopra per aggiungere passeggeri.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Passeggeri del servizio</h3>
          {fields.map((field, index) => (
            <PasseggeroCard 
              key={field.id}
              index={index} 
              onRemove={() => remove(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
