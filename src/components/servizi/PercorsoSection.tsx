import React from "react";
import { useFormContext, useWatch, Controller } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MobileInput } from "@/components/ui/mobile-input";
import { Flag, Target } from "lucide-react";
import { ServizioFormData } from "@/lib/types/servizi";

export const PercorsoSection = () => {
  const { control, setValue } = useFormContext<ServizioFormData>();
  
  // Watch all needed values at top level (hooks rules)
  const passeggeri = useWatch({ control, name: "passeggeri" }) || [];
  const partenzaTipo = useWatch({ control, name: "partenza_tipo" });
  const destinazioneTipo = useWatch({ control, name: "destinazione_tipo" });
  const partenzaPasseggeroIndex = useWatch({ control, name: "partenza_passeggero_index" });
  const destinazionePasseggeroIndex = useWatch({ control, name: "destinazione_passeggero_index" });
  
  // Helper per costruire indirizzo display
  const getPasseggeroIndirizzo = (p: any) => {
    const parts = [p?.indirizzo, p?.localita].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  const getPasseggeroNome = (p: any) => {
    return p?.nome_cognome || `${p?.nome || ''} ${p?.cognome || ''}`.trim() || 'Passeggero';
  };
  
  // Quando seleziono un passeggero per partenza, auto-popolo campi
  const handlePartenzaChange = (value: string) => {
    if (value !== 'personalizzato') {
      const idx = parseInt(value);
      if (!isNaN(idx) && passeggeri[idx]) {
        setValue("partenza_passeggero_index", idx);
        setValue("citta_presa", passeggeri[idx].localita || '');
        setValue("indirizzo_presa", passeggeri[idx].indirizzo || '');
      }
    }
  };
  
  // Quando seleziono un passeggero per destinazione, auto-popolo campi
  const handleDestinazioneChange = (value: string) => {
    if (value !== 'personalizzato') {
      const idx = parseInt(value);
      if (!isNaN(idx) && passeggeri[idx]) {
        setValue("destinazione_passeggero_index", idx);
        setValue("citta_destinazione", passeggeri[idx].localita || '');
        setValue("indirizzo_destinazione", passeggeri[idx].indirizzo || '');
      }
    }
  };

  // Calcola valore corrente per Select partenza
  const partenzaSelectValue = partenzaTipo === 'passeggero' && partenzaPasseggeroIndex !== undefined 
    ? partenzaPasseggeroIndex.toString() 
    : 'personalizzato';

  // Calcola valore corrente per Select destinazione
  const destinazioneSelectValue = destinazioneTipo === 'passeggero' && destinazionePasseggeroIndex !== undefined 
    ? destinazionePasseggeroIndex.toString() 
    : 'personalizzato';
  
  return (
    <div className="space-y-6">
      {/* PARTENZA */}
      <div className="space-y-3 border rounded-lg p-4 bg-card">
        <Label className="text-base font-medium flex items-center gap-2">
          <Flag className="h-4 w-4 text-primary" />
          Punto di partenza
        </Label>
        
        <Controller
          control={control}
          name="partenza_tipo"
          defaultValue="personalizzato"
          render={({ field }) => (
            <Select 
              value={partenzaSelectValue} 
              onValueChange={(val) => {
                if (val === 'personalizzato') {
                  field.onChange('personalizzato');
                  setValue("partenza_passeggero_index", undefined);
                } else {
                  field.onChange('passeggero');
                  handlePartenzaChange(val);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleziona punto di partenza" />
              </SelectTrigger>
              <SelectContent>
                {/* Opzioni passeggeri */}
                {passeggeri.map((p: any, idx: number) => {
                  const indirizzo = getPasseggeroIndirizzo(p);
                  const nome = getPasseggeroNome(p);
                  return (
                    <SelectItem key={idx} value={idx.toString()}>
                      <span className="flex flex-col items-start">
                        <span>Indirizzo di {nome}</span>
                        {indirizzo ? (
                          <span className="text-xs text-muted-foreground">({indirizzo})</span>
                        ) : (
                          <span className="text-xs text-amber-600">(Nessun indirizzo)</span>
                        )}
                      </span>
                    </SelectItem>
                  );
                })}
                
                {/* Opzione personalizzato */}
                <SelectItem value="personalizzato">
                  Altro indirizzo...
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        />

        {/* Campi indirizzo personalizzato partenza */}
        {partenzaTipo === 'personalizzato' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Controller
              control={control}
              name="citta_presa"
              render={({ field }) => (
                <div>
                  <Label className="text-xs mb-1 block">Città</Label>
                  <MobileInput
                    {...field}
                    value={field.value || ''}
                    placeholder="Es: Milano"
                    fluid
                  />
                </div>
              )}
            />
            <Controller
              control={control}
              name="indirizzo_presa"
              render={({ field }) => (
                <div>
                  <Label className="text-xs mb-1 block">Indirizzo *</Label>
                  <MobileInput
                    {...field}
                    value={field.value || ''}
                    placeholder="Es: Via Roma 1"
                    fluid
                  />
                </div>
              )}
            />
          </div>
        )}
      </div>
      
      {/* DESTINAZIONE */}
      <div className="space-y-3 border rounded-lg p-4 bg-card">
        <Label className="text-base font-medium flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Punto di destinazione
        </Label>
        
        <Controller
          control={control}
          name="destinazione_tipo"
          defaultValue="personalizzato"
          render={({ field }) => (
            <Select 
              value={destinazioneSelectValue} 
              onValueChange={(val) => {
                if (val === 'personalizzato') {
                  field.onChange('personalizzato');
                  setValue("destinazione_passeggero_index", undefined);
                } else {
                  field.onChange('passeggero');
                  handleDestinazioneChange(val);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleziona destinazione" />
              </SelectTrigger>
              <SelectContent>
                {/* Opzioni passeggeri */}
                {passeggeri.map((p: any, idx: number) => {
                  const indirizzo = getPasseggeroIndirizzo(p);
                  const nome = getPasseggeroNome(p);
                  return (
                    <SelectItem key={idx} value={idx.toString()}>
                      <span className="flex flex-col items-start">
                        <span>Indirizzo di {nome}</span>
                        {indirizzo ? (
                          <span className="text-xs text-muted-foreground">({indirizzo})</span>
                        ) : (
                          <span className="text-xs text-amber-600">(Nessun indirizzo)</span>
                        )}
                      </span>
                    </SelectItem>
                  );
                })}
                
                {/* Opzione personalizzato */}
                <SelectItem value="personalizzato">
                  Altro indirizzo...
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        />

        {/* Campi indirizzo personalizzato destinazione */}
        {destinazioneTipo === 'personalizzato' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Controller
              control={control}
              name="citta_destinazione"
              render={({ field }) => (
                <div>
                  <Label className="text-xs mb-1 block">Città</Label>
                  <MobileInput
                    {...field}
                    value={field.value || ''}
                    placeholder="Es: Milano"
                    fluid
                  />
                </div>
              )}
            />
            <Controller
              control={control}
              name="indirizzo_destinazione"
              render={({ field }) => (
                <div>
                  <Label className="text-xs mb-1 block">Indirizzo *</Label>
                  <MobileInput
                    {...field}
                    value={field.value || ''}
                    placeholder="Es: Aeroporto Malpensa, Terminal 1"
                    fluid
                  />
                </div>
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
};
