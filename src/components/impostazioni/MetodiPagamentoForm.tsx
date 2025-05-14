
import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash } from "lucide-react";
import { nanoid } from "nanoid";
import { MetodoPagamentoOption } from "@/lib/api/impostazioni/types";

export function MetodiPagamentoForm() {
  const { control, watch } = useFormContext();
  const aliquoteIva = watch("aliquote_iva") || [];
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "metodi_pagamento",
  });

  const addNewMetodo = () => {
    // Ensure we're adding an object with a required id property
    const newMetodo: MetodoPagamentoOption = {
      id: nanoid(),
      nome: "", 
      iva_predefinita: null
    };
    append(newMetodo);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          Definisci i metodi di pagamento disponibili per i servizi
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addNewMetodo}
        >
          <Plus className="h-4 w-4 mr-1" /> Aggiungi Metodo
        </Button>
      </div>
      
      {fields.length === 0 ? (
        <div className="text-center p-4 border border-dashed rounded-md">
          Nessun metodo di pagamento definito. Aggiungine uno!
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="pt-4">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-5">
                    <FormField
                      control={control}
                      name={`metodi_pagamento.${index}.nome`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Metodo</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Es: Contanti, Carta, Bonifico" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="col-span-5">
                    <FormField
                      control={control}
                      name={`metodi_pagamento.${index}.iva_predefinita`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IVA Predefinita</FormLabel>
                          <Select
                            value={field.value || "none"}
                            onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona IVA" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Nessuna IVA predefinita</SelectItem>
                              {aliquoteIva.map((aliquota: any) => (
                                <SelectItem key={aliquota.id} value={aliquota.id}>
                                  {aliquota.nome} ({aliquota.percentuale}%)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="col-span-2 flex items-end justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
