
import React, { useState, useEffect } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users } from "lucide-react";
import { ServizioFormData } from "@/lib/types/servizi";
import { PasseggeroCompactCard } from "./PasseggeroCompactCard";
import { PasseggeroEditCard } from "./PasseggeroEditCard";
import { PasseggeroSelector } from "./PasseggeroSelector";
import { PasseggeriList } from "./PasseggeriList";
import { PasseggeroPresaList } from "./PasseggeroPresaList";

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
  showPresaIntermedia?: boolean;
  orarioServizio?: string;
  indirizzoServizio?: string;
  cittaServizio?: string;
  destinazioneServizio?: string;
  cittaDestinazioneServizio?: string;
}

export function PasseggeroForm({ 
  userRole, 
  tipo_cliente, 
  clientePrivatoData,
  showPresaIntermedia = false,
  orarioServizio = '',
  indirizzoServizio = '',
  cittaServizio = '',
  destinazioneServizio = '',
  cittaDestinazioneServizio = '',
}: PasseggeroFormProps) {
  const form = useFormContext<ServizioFormData>();
  const { control } = form;
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  // Watch per azienda_id
  const azienda_id = useWatch({ control, name: "azienda_id" });
  
  // Utilizziamo useFieldArray per gestire l'array dinamico di passeggeri
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "passeggeri",
  });

  // Log essenziale - solo quando ci sono passeggeri
  useEffect(() => {
    if (fields.length > 0) {
      console.log('[PasseggeroForm] Passeggeri caricati:', fields.length);
    }
  }, [fields.length]);

  // Aggiungi un passeggero dal selector con campi presa intermedia
  const handlePasseggeroSelect = (passeggero: any) => {
    console.log('[PasseggeroForm] ✅ Ricevuto passeggero:', passeggero.nome_cognome);
    console.log('[PasseggeroForm] Fields PRIMA:', fields.length);
    console.log('[PasseggeroForm] usa_indirizzo_personalizzato:', passeggero.usa_indirizzo_personalizzato);
    
    const passeggeroConPresa = {
      ...passeggero,
      ordine: fields.length + 1,
      // ✅ FIX: rispetta la scelta dell'utente dal dialog
      presa_tipo: passeggero.usa_indirizzo_personalizzato ? 'passeggero' : 'servizio' as const,
      presa_indirizzo_custom: '',
      presa_citta_custom: '',
      presa_orario: '',
      presa_usa_orario_servizio: fields.length === 0, // Solo il primo usa orario servizio
      destinazione_tipo: 'servizio' as const,
      destinazione_indirizzo_custom: '',
      destinazione_citta_custom: '',
      indirizzo_rubrica: passeggero.indirizzo || '',
      localita_rubrica: passeggero.localita || '',
    };
    
    append(passeggeroConPresa);
    console.log('[PasseggeroForm] Fields DOPO append:', fields.length + 1);
    
    // Scroll al container passeggeri per mostrare il nuovo elemento
    setTimeout(() => {
      const container = document.getElementById('passeggeri-container');
      if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 150);
    
    setEditingIndex(null);
  };
  
  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };
  
  const handleSaveEdit = () => {
    setEditingIndex(null);
  };
  
  const handleCancelEdit = () => {
    setEditingIndex(null);
  };
  
  const handleRemove = (index: number) => {
    remove(index);
    if (editingIndex === index) {
      setEditingIndex(null);
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      move(index, index - 1);
      
      if (editingIndex === index) {
        setEditingIndex(index - 1);
      } else if (editingIndex === index - 1) {
        setEditingIndex(index);
      }
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < fields.length - 1) {
      move(index, index + 1);
      
      if (editingIndex === index) {
        setEditingIndex(index + 1);
      } else if (editingIndex === index + 1) {
        setEditingIndex(index);
      }
    }
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

      {/* Lista passeggeri - con drag-and-drop per prese intermedie */}
      {fields.length > 0 && (
        showPresaIntermedia ? (
          <div id="passeggeri-container" key={`presa-list-${fields.length}`}>
            <PasseggeroPresaList
              fields={fields}
              remove={remove}
              move={move}
              orarioServizio={orarioServizio}
              indirizzoServizio={indirizzoServizio}
              cittaServizio={cittaServizio}
              destinazioneServizio={destinazioneServizio}
              cittaDestinazioneServizio={cittaDestinazioneServizio}
            />
          </div>
        ) : (
          <div id="passeggeri-container" className="space-y-3" key={`compact-list-${fields.length}`}>
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Passeggeri del servizio ({fields.length})
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            {fields.length > 1 && (
              <div className="text-xs text-muted-foreground text-center pb-1">
                💡 Usa le frecce per ordinare la sequenza di pick-up
              </div>
            )}
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id}>
                  {editingIndex === index ? (
                    <PasseggeroEditCard 
                      index={index} 
                      onRemove={() => handleRemove(index)}
                      onSave={handleSaveEdit}
                      onCancel={handleCancelEdit}
                    />
                  ) : (
                    <PasseggeroCompactCard
                      index={index}
                      totalCount={fields.length}
                      onEdit={() => handleEdit(index)}
                      onRemove={() => handleRemove(index)}
                      onMoveUp={() => handleMoveUp(index)}
                      onMoveDown={() => handleMoveDown(index)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )
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
