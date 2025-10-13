
import React from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users } from "lucide-react";
import { ServizioFormData } from "@/lib/types/servizi";
import { PasseggeroCard } from "./PasseggeroCard";
import { PasseggeroSelector } from "./PasseggeroSelector";
import { PasseggeriList } from "./PasseggeriList";
import { PassengerListItem } from "./PassengerListItem";
import { useToast } from "@/hooks/use-toast";

export function PasseggeroForm({ userRole }: { userRole?: string }) {
  const { control, setValue, getValues } = useFormContext<ServizioFormData>();
  const { toast } = useToast();
  
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
    console.log('[PasseggeroForm] handlePasseggeroSelect called with:', passeggero);
    console.log('[PasseggeroForm] Current fields count:', fields.length);
    
    // ✅ Controlla se passeggero già presente
    const currentPasseggeri = getValues('passeggeri') || [];
    const isDuplicate = currentPasseggeri.some(p => 
      p.passeggero_id === passeggero.passeggero_id
    );

    if (isDuplicate) {
      toast({
        title: "Passeggero già presente",
        description: "Questo passeggero è già stato aggiunto a questo servizio",
        variant: "destructive",
      });
      return;
    }
    
    const currentIndex = fields.length;
    append(passeggero);
    
    console.log('[PasseggeroForm] Passenger appended at index:', currentIndex);
    
    // Assicuriamoci che tutti i campi siano popolati correttamente
    setTimeout(() => {
      console.log('[PasseggeroForm] Setting values for passenger at index:', currentIndex);
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
      {/* Header compatto */}
      <div className="flex flex-col gap-3">
        {azienda_id && !referente_id && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">
              <strong>ℹ️ Modalità senza referente:</strong> I passeggeri verranno collegati direttamente all'azienda.
            </p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            {fields.length} passeggero{fields.length !== 1 ? 'i' : ''} aggiunto{fields.length !== 1 ? 'i' : ''}
          </p>
          <PasseggeriList userRole={userRole} />
        </div>
      </div>

      {/* Lista passeggeri già aggiunti - Nuovo feedback contestuale */}
      {fields.length > 0 && (
        <div className="bg-muted/30 rounded-lg p-4 border-2 border-dashed">
          <h4 className="font-medium mb-3 text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Passeggeri nel servizio ({fields.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {fields.map((field, idx) => (
              <PassengerListItem 
                key={field.id}
                index={idx}
                fieldId={field.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Passenger Selector */}
      <div className="bg-muted/30 border-2 border-dashed rounded-lg p-4">
        <PasseggeroSelector
          azienda_id={azienda_id}
          referente_id={referente_id}
          onPasseggeroSelect={handlePasseggeroSelect}
        />
      </div>

      {/* Selected Passengers List */}
      {fields.length === 0 ? (
        <div className="text-center py-8 bg-muted/20 border rounded-lg">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
            <PlusCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium mb-1">Nessun passeggero aggiunto</h3>
          <p className="text-sm text-muted-foreground">
            Usa il selettore sopra per aggiungere passeggeri
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Compila le informazioni dei passeggeri</h3>
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
