import React, { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { InfoAziendaForm } from "./InfoAziendaForm";
import { MetodiPagamentoForm } from "./MetodiPagamentoForm";
import { AliquoteIvaForm } from "./AliquoteIvaForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save } from "lucide-react";
import { ImpostazioniFormData, MetodoPagamentoOption, AliquotaIvaOption } from "@/lib/types/impostazioni";
import { updateImpostazioni } from "@/lib/api/impostazioni/updateImpostazioni";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";

const formSchema = z.object({
  nome_azienda: z.string().min(1, { message: "Il nome dell'azienda è obbligatorio" }),
  partita_iva: z.string().optional(),
  indirizzo_sede: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email({ message: "Inserisci un indirizzo email valido" }).optional().or(z.literal("")),
  metodi_pagamento: z.array(
    z.object({
      id: z.string().optional(),
      nome: z.string(),
      iva_applicabile: z.boolean().optional(),
      aliquota_iva: z.string().optional(),
      report_attivo: z.boolean().optional(),
    })
  ),
  aliquote_iva: z.array(
    z.object({
      id: z.string().optional(),
      nome: z.string(),
      percentuale: z.number(),
      descrizione: z.string().optional(),
    })
  ),
  id: z.string().optional(),
});

interface ImpostazioniFormProps {
  initialData: ImpostazioniFormData;
  onSaved?: () => void;
}

export function ImpostazioniForm({ initialData, onSaved }: ImpostazioniFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ensure each item has a required id field
  const ensureMetodiPagamentoIds = (metodi: any[] = []): MetodoPagamentoOption[] => {
    return metodi.map(metodo => ({
      id: metodo.id || uuidv4(),
      nome: metodo.nome || "",
      iva_applicabile: metodo.iva_applicabile === true,
      aliquota_iva: metodo.aliquota_iva || "",
      report_attivo: metodo.report_attivo === true,
    }));
  };

  const ensureAliquoteIvaIds = (aliquote: any[] = []): AliquotaIvaOption[] => {
    return aliquote.map(aliquota => ({
      id: aliquota.id || uuidv4(),
      nome: aliquota.nome || "",
      percentuale: Number(aliquota.percentuale || 0),
      descrizione: aliquota.descrizione || "",
    }));
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: initialData.id,
      nome_azienda: initialData.nome_azienda || "",
      partita_iva: initialData.partita_iva || "",
      telefono: initialData.telefono || "",
      email: initialData.email || "",
      indirizzo_sede: initialData.indirizzo_sede || "",
      metodi_pagamento: initialData.metodi_pagamento || [],
      aliquote_iva: initialData.aliquote_iva || [],
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Ensure all objects have the required properties with proper types
      const formattedData = {
        ...data,
        // Make sure ID exists for the update operation
        id: data.id,
        metodi_pagamento: ensureMetodiPagamentoIds(data.metodi_pagamento),
        aliquote_iva: ensureAliquoteIvaIds(data.aliquote_iva),
      };
      
      // Check if we have an ID for the update
      if (!formattedData.id) {
        throw new Error("ID mancante per il salvataggio delle impostazioni");
      }
      
      await updateImpostazioni(formattedData);
      
      toast({
        title: "Impostazioni aggiornate",
        description: "Le modifiche sono state salvate con successo.",
      });
      
      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio delle impostazioni.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ensure IDs are present when passing to child components
  const currentMetodi = ensureMetodiPagamentoIds(form.watch("metodi_pagamento"));
  const currentAliquote = ensureAliquoteIvaIds(form.watch("aliquote_iva"));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Informazioni Azienda</TabsTrigger>
            <TabsTrigger value="pagamenti">Metodi di Pagamento</TabsTrigger>
            <TabsTrigger value="iva">Aliquote IVA</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4">
            <FormField
              control={form.control}
              name="nome_azienda"
              render={({ field }) => (
                <InfoAziendaForm
                  nome={field.value}
                  onChangeNome={field.onChange}
                  partitaIva={form.watch("partita_iva") || ""}
                  onChangePartitaIva={(value) => form.setValue("partita_iva", value)}
                  indirizzo={form.watch("indirizzo_sede") || ""}
                  onChangeIndirizzo={(value) => form.setValue("indirizzo_sede", value)}
                  telefono={form.watch("telefono") || ""}
                  onChangeTelefono={(value) => form.setValue("telefono", value)}
                  email={form.watch("email") || ""}
                  onChangeEmail={(value) => form.setValue("email", value)}
                />
              )}
            />
          </TabsContent>

          <TabsContent value="pagamenti" className="mt-4">
            <FormField
              control={form.control}
              name="metodi_pagamento"
              render={({ field }) => (
                <MetodiPagamentoForm
                  metodi={currentMetodi}
                  aliquoteIva={currentAliquote}
                  onChange={(metodi) => field.onChange(metodi)}
                />
              )}
            />
          </TabsContent>

          <TabsContent value="iva" className="mt-4">
            <FormField
              control={form.control}
              name="aliquote_iva"
              render={({ field }) => (
                <AliquoteIvaForm
                  aliquote={currentAliquote}
                  onChange={(aliquote) => field.onChange(aliquote)}
                />
              )}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              "Salvataggio..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salva Modifiche
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
