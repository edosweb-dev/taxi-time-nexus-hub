
import { useFieldArray, useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { MinusCircle, PlusCircle } from "lucide-react";
import { ServizioFormData } from "@/lib/types/servizi";

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
      orario_presa: "",
      luogo_presa: "",
      usa_indirizzo_personalizzato: false,
      destinazione: "",
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
          <Card key={field.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">
                  Passeggero {index + 1}
                </CardTitle>
                <Button 
                  type="button" 
                  onClick={() => remove(index)} 
                  variant="ghost" 
                  size="sm"
                  className="text-destructive h-8 px-2"
                >
                  <MinusCircle className="h-4 w-4 mr-1" />
                  Rimuovi
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name={`passeggeri.${index}.nome_cognome`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome e cognome *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Mario Rossi" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name={`passeggeri.${index}.orario_presa`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Orario di presa *</FormLabel>
                      <FormControl>
                        <Input {...field} type="time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name={`passeggeri.${index}.email`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="email@esempio.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`passeggeri.${index}.telefono`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefono</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+39 123 456 7890" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={control}
                  name={`passeggeri.${index}.usa_indirizzo_personalizzato`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Usa indirizzo personalizzato
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`passeggeri.${index}.luogo_presa`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Luogo di presa *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Via Roma, 1, Milano" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`passeggeri.${index}.destinazione`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destinazione *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Aeroporto Malpensa, Milano" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
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
