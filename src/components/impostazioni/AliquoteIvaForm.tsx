
import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash } from "lucide-react";
import { nanoid } from "nanoid";
import { AliquotaIvaOption } from "@/lib/api/impostazioni/types";

export function AliquoteIvaForm() {
  const { control } = useFormContext();
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "aliquote_iva",
  });

  const addNewAliquota = () => {
    // Ensure we're adding an object with a required id property
    const newAliquota: AliquotaIvaOption = {
      id: nanoid(),
      nome: "",
      percentuale: 22,
      descrizione: null
    };
    append(newAliquota);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          Definisci le aliquote IVA disponibili per i servizi
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addNewAliquota}
        >
          <Plus className="h-4 w-4 mr-1" /> Aggiungi Aliquota
        </Button>
      </div>
      
      {fields.length === 0 ? (
        <div className="text-center p-4 border border-dashed rounded-md">
          Nessuna aliquota IVA definita. Aggiungine una!
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="pt-4">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-4">
                    <FormField
                      control={control}
                      name={`aliquote_iva.${index}.nome`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Es: IVA Standard, Ridotta" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <FormField
                      control={control}
                      name={`aliquote_iva.${index}.percentuale`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Percentuale</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              step="0.1"
                              placeholder="22"
                              value={field.value}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="col-span-5">
                    <FormField
                      control={control}
                      name={`aliquote_iva.${index}.descrizione`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrizione</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Descrizione opzionale"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value || null)}
                              className="resize-none"
                              rows={1}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="col-span-1 flex items-end justify-end">
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
