
import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ServizioFormData } from "@/lib/types/servizi";
import { PasseggeroCard } from "./PasseggeroCard";

export function PasseggeroForm() {
  const { control } = useFormContext<ServizioFormData>();
  
  // Utilizziamo useFieldArray per gestire l'array dinamico di passeggeri
  const { fields, append, remove } = useFieldArray({
    control,
    name: "passeggeri",
  });

  // Aggiungi un nuovo passeggero con valori predefiniti
  const addPasseggero = () => {
    append({
      nome_cognome: "",
      email: "",
      telefono: "",
      orario_presa_personalizzato: "",
      luogo_presa_personalizzato: "",
      usa_indirizzo_personalizzato: false,
      destinazione_personalizzato: "",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Passeggeri</h2>
        <Button 
          type="button" 
          onClick={addPasseggero} 
          variant="outline"
          className="flex items-center gap-1"
        >
          <PlusCircle className="h-4 w-4" />
          Aggiungi passeggero
        </Button>
      </div>

      {fields.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center text-muted-foreground">
            Nessun passeggero aggiunto. Clicca su "Aggiungi passeggero" per iniziare.
          </CardContent>
        </Card>
      ) : (
        fields.map((field, index) => (
          <PasseggeroCard 
            key={field.id}
            index={index} 
            onRemove={() => remove(index)}
          />
        ))
      )}
      
      {fields.length > 0 && (
        <Button 
          type="button" 
          onClick={addPasseggero} 
          variant="outline" 
          className="w-full border-dashed"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Aggiungi altro passeggero
        </Button>
      )}
    </div>
  );
}
