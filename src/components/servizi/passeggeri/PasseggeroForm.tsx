
import React, { useEffect, useRef } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users } from "lucide-react";
import { ServizioFormData } from "@/lib/types/servizi";
import { PasseggeroCard } from "./PasseggeroCard";
import { PasseggeroSelector } from "./PasseggeroSelector";
import { PasseggeriList } from "./PasseggeriList";
import { PassengerListItem } from "./PassengerListItem";

interface PasseggeroFormProps {
  userRole?: string;
  tipo_cliente?: 'azienda' | 'privato';
  clientePrivatoData?: {
    nome: string;
    cognome: string;
    email?: string;
    telefono?: string;
    indirizzo?: string;
    citta?: string;
  };
}

export function PasseggeroForm({ userRole, tipo_cliente, clientePrivatoData }: PasseggeroFormProps) {
  const { control, setValue } = useFormContext<ServizioFormData>();
  
  // Watch per azienda_id
  const azienda_id = useWatch({ control, name: "azienda_id" });
  
  console.log('[PasseggeroForm] 📥 Watched azienda_id:', azienda_id);
  
  // Utilizziamo useFieldArray per gestire l'array dinamico di passeggeri
  const { fields, append, remove } = useFieldArray({
    control,
    name: "passeggeri",
  });

  // Aggiungi un passeggero dal selector
  const handlePasseggeroSelect = (passeggero: any) => {
    console.log('[PasseggeroForm] handlePasseggeroSelect called with:', passeggero);
    console.log('[PasseggeroForm] Current fields count:', fields.length);
    
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
    <div className="space-y-4">
      {/* Info banner per cliente privato */}
      {tipo_cliente === 'privato' && (
        <div className="flex items-start gap-3 p-3 bg-blue-50/50 border border-blue-200/50 rounded-lg">
          <div className="p-1.5 rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
            <Users className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-blue-900 mb-0.5">Cliente privato</p>
            <p className="text-xs text-blue-700">
              Aggiungi passeggeri manualmente. Non sono collegati a un'azienda.
            </p>
          </div>
        </div>
      )}

      {/* Header section con counter e link gestione */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Passeggeri
            </h3>
            <p className="text-xs text-muted-foreground">
              {fields.length} {fields.length === 1 ? 'passeggero' : 'passeggeri'}
            </p>
          </div>
        </div>
        <PasseggeriList userRole={userRole} />
      </div>

      {/* Passeggeri già aggiunti - Cards compatte */}
      {fields.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Nel servizio
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
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

      {/* Selettore passeggeri - Area principale */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Aggiungi passeggeri
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        
        <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4">
        <PasseggeroSelector
          azienda_id={azienda_id}
          tipo_cliente={tipo_cliente}
          clientePrivatoData={clientePrivatoData}
          onPasseggeroSelect={handlePasseggeroSelect}
        />
        </div>
      </div>

      {/* Form dettagli passeggeri */}
      {fields.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Dettagli passeggeri
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-3">
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

      {/* Empty state - solo se non ci sono passeggeri */}
      {fields.length === 0 && (
        <div className="text-center py-8 rounded-lg border-2 border-dashed bg-muted/5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted/50 mb-3">
            <PlusCircle className="h-5 w-5 text-muted-foreground/70" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            Nessun passeggero aggiunto
          </p>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Seleziona dall'elenco sopra o crea un nuovo passeggero
          </p>
        </div>
      )}
    </div>
  );
}
