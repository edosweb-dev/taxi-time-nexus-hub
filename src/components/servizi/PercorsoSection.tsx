import React from "react";
import { useFormContext, useWatch, Controller } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MobileInput } from "@/components/ui/mobile-input";
import { Flag, Target, MapPin } from "lucide-react";
import { ServizioFormData } from "@/lib/types/servizi";

export const PercorsoSection = () => {
  const { control, setValue } = useFormContext<ServizioFormData>();
  
  // Watch passeggeri e tipi percorso
  const passeggeri = useWatch({ control, name: "passeggeri" }) || [];
  const partenzaTipo = useWatch({ control, name: "partenza_tipo" });
  const destinazioneTipo = useWatch({ control, name: "destinazione_tipo" });
  const partenzaPasseggeroIndex = useWatch({ control, name: "partenza_passeggero_index" });
  const destinazionePasseggeroIndex = useWatch({ control, name: "destinazione_passeggero_index" });
  
  // Quando seleziono un passeggero per partenza, auto-popolo campi
  const handlePartenzaPasseggeroChange = (index: string) => {
    const idx = parseInt(index);
    setValue("partenza_passeggero_index", idx);
    
    const passeggero = passeggeri[idx];
    if (passeggero) {
      setValue("citta_presa", passeggero.localita || "");
      setValue("indirizzo_presa", passeggero.indirizzo || "");
    }
  };
  
  // Quando seleziono un passeggero per destinazione, auto-popolo campi
  const handleDestinazionePasseggeroChange = (index: string) => {
    const idx = parseInt(index);
    setValue("destinazione_passeggero_index", idx);
    
    const passeggero = passeggeri[idx];
    if (passeggero) {
      setValue("citta_destinazione", passeggero.localita || "");
      setValue("indirizzo_destinazione", passeggero.indirizzo || "");
    }
  };
  
  return (
    <div className="space-y-6">
      {/* PARTENZA */}
      <div className="space-y-4 border rounded-lg p-4 bg-card">
        <Label className="text-base font-medium flex items-center gap-2">
          <Flag className="h-4 w-4" />
          Punto di partenza
        </Label>
        
        <Controller
          control={control}
          name="partenza_tipo"
          defaultValue="personalizzato"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="space-y-3"
            >
              {/* Opzione: Indirizzo personalizzato */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="personalizzato" id="partenza-personalizzato" />
                  <Label htmlFor="partenza-personalizzato" className="font-normal cursor-pointer">
                    Indirizzo personalizzato
                  </Label>
                </div>
                
                {partenzaTipo === 'personalizzato' && (
                  <div className="ml-6 space-y-3">
                    <Controller
                      control={control}
                      name="citta_presa"
                      render={({ field }) => (
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1.5 block">Città</Label>
                          <MobileInput
                            {...field}
                            placeholder="Milano"
                          />
                        </div>
                      )}
                    />
                    <Controller
                      control={control}
                      name="indirizzo_presa"
                      render={({ field }) => (
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1.5 block">Indirizzo *</Label>
                          <MobileInput
                            {...field}
                            placeholder="Via Roma 1"
                          />
                        </div>
                      )}
                    />
                  </div>
                )}
              </div>
              
              {/* Opzione: Usa indirizzo passeggero */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="passeggero" 
                    id="partenza-passeggero"
                    disabled={passeggeri.length === 0}
                  />
                  <Label 
                    htmlFor="partenza-passeggero" 
                    className="font-normal cursor-pointer"
                  >
                    Usa indirizzo passeggero
                    {passeggeri.length === 0 && (
                      <span className="text-xs text-muted-foreground ml-2">
                        (Aggiungi prima un passeggero)
                      </span>
                    )}
                  </Label>
                </div>
                
                {partenzaTipo === 'passeggero' && passeggeri.length > 0 && (
                  <div className="ml-6 space-y-2">
                    <Select
                      value={partenzaPasseggeroIndex?.toString()}
                      onValueChange={handlePartenzaPasseggeroChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona passeggero..." />
                      </SelectTrigger>
                      <SelectContent>
                        {passeggeri.map((p: any, idx: number) => (
                          <SelectItem key={idx} value={idx.toString()}>
                            {idx + 1}️⃣ {p.nome_cognome || `${p.nome || ''} ${p.cognome || ''}`.trim()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* Preview indirizzo selezionato */}
                    {partenzaPasseggeroIndex !== undefined && passeggeri[partenzaPasseggeroIndex] && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                          {passeggeri[partenzaPasseggeroIndex].localita && (
                            <div>{passeggeri[partenzaPasseggeroIndex].localita}</div>
                          )}
                          {passeggeri[partenzaPasseggeroIndex].indirizzo && (
                            <div>{passeggeri[partenzaPasseggeroIndex].indirizzo}</div>
                          )}
                          {!passeggeri[partenzaPasseggeroIndex].localita && 
                           !passeggeri[partenzaPasseggeroIndex].indirizzo && (
                            <div className="text-amber-600">
                              ⚠️ Questo passeggero non ha un indirizzo
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </RadioGroup>
          )}
        />
      </div>
      
      {/* DESTINAZIONE */}
      <div className="space-y-4 border rounded-lg p-4 bg-card">
        <Label className="text-base font-medium flex items-center gap-2">
          <Target className="h-4 w-4" />
          Punto di destinazione
        </Label>
        
        <Controller
          control={control}
          name="destinazione_tipo"
          defaultValue="personalizzato"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="space-y-3"
            >
              {/* Opzione: Indirizzo personalizzato */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="personalizzato" id="dest-personalizzato" />
                  <Label htmlFor="dest-personalizzato" className="font-normal cursor-pointer">
                    Indirizzo personalizzato
                  </Label>
                </div>
                
                {destinazioneTipo === 'personalizzato' && (
                  <div className="ml-6 space-y-3">
                    <Controller
                      control={control}
                      name="citta_destinazione"
                      render={({ field }) => (
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1.5 block">Città</Label>
                          <MobileInput
                            {...field}
                            placeholder="Malpensa"
                          />
                        </div>
                      )}
                    />
                    <Controller
                      control={control}
                      name="indirizzo_destinazione"
                      render={({ field }) => (
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1.5 block">Indirizzo *</Label>
                          <MobileInput
                            {...field}
                            placeholder="Terminal 1, Arrivi"
                          />
                        </div>
                      )}
                    />
                  </div>
                )}
              </div>
              
              {/* Opzione: Usa indirizzo passeggero */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="passeggero" 
                    id="dest-passeggero"
                    disabled={passeggeri.length === 0}
                  />
                  <Label 
                    htmlFor="dest-passeggero" 
                    className="font-normal cursor-pointer"
                  >
                    Usa indirizzo passeggero
                    {passeggeri.length === 0 && (
                      <span className="text-xs text-muted-foreground ml-2">
                        (Aggiungi prima un passeggero)
                      </span>
                    )}
                  </Label>
                </div>
                
                {destinazioneTipo === 'passeggero' && passeggeri.length > 0 && (
                  <div className="ml-6 space-y-2">
                    <Select
                      value={destinazionePasseggeroIndex?.toString()}
                      onValueChange={handleDestinazionePasseggeroChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona passeggero..." />
                      </SelectTrigger>
                      <SelectContent>
                        {passeggeri.map((p: any, idx: number) => (
                          <SelectItem key={idx} value={idx.toString()}>
                            {idx + 1}️⃣ {p.nome_cognome || `${p.nome || ''} ${p.cognome || ''}`.trim()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* Preview indirizzo selezionato */}
                    {destinazionePasseggeroIndex !== undefined && passeggeri[destinazionePasseggeroIndex] && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                          {passeggeri[destinazionePasseggeroIndex].localita && (
                            <div>{passeggeri[destinazionePasseggeroIndex].localita}</div>
                          )}
                          {passeggeri[destinazionePasseggeroIndex].indirizzo && (
                            <div>{passeggeri[destinazionePasseggeroIndex].indirizzo}</div>
                          )}
                          {!passeggeri[destinazionePasseggeroIndex].localita && 
                           !passeggeri[destinazionePasseggeroIndex].indirizzo && (
                            <div className="text-amber-600">
                              ⚠️ Questo passeggero non ha un indirizzo
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </RadioGroup>
          )}
        />
      </div>
    </div>
  );
};
