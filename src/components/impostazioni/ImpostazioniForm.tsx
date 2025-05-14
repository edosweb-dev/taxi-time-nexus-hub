
import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Impostazioni } from "@/lib/api/impostazioni/types";
import { AziendaInfoForm } from "./AziendaInfoForm";
import { MetodiPagamentoForm } from "./MetodiPagamentoForm";
import { AliquoteIvaForm } from "./AliquoteIvaForm";
import { useImpostazioni } from "@/hooks/useImpostazioni";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const impostazioniFormSchema = z.object({
  nome_azienda: z.string().min(1, "Il nome dell'azienda è obbligatorio"),
  partita_iva: z.string().nullable(),
  indirizzo_sede: z.string().nullable(),
  telefono: z.string().nullable(),
  email: z.string().email("Inserisci un'email valida").nullable(),
  metodi_pagamento: z.array(
    z.object({
      id: z.string(),
      nome: z.string().min(1, "Il nome del metodo è obbligatorio"),
      iva_predefinita: z.string().nullable(),
    })
  ),
  aliquote_iva: z.array(
    z.object({
      id: z.string(),
      nome: z.string().min(1, "Il nome dell'aliquota è obbligatorio"),
      percentuale: z.number().min(0, "La percentuale non può essere negativa"),
      descrizione: z.string().nullable(),
    })
  )
});

type ImpostazioniFormValues = z.infer<typeof impostazioniFormSchema>;

export function ImpostazioniForm({ impostazioni }: { impostazioni: Impostazioni | null }) {
  const { updateImpostazioni, isUpdating } = useImpostazioni();

  const defaultValues: ImpostazioniFormValues = {
    nome_azienda: impostazioni?.nome_azienda || "",
    partita_iva: impostazioni?.partita_iva || null,
    indirizzo_sede: impostazioni?.indirizzo_sede || null,
    telefono: impostazioni?.telefono || null,
    email: impostazioni?.email || null,
    metodi_pagamento: impostazioni?.metodi_pagamento || [],
    aliquote_iva: impostazioni?.aliquote_iva || [],
  };

  const form = useForm<ImpostazioniFormValues>({
    resolver: zodResolver(impostazioniFormSchema),
    defaultValues,
  });

  const onSubmit = async (values: ImpostazioniFormValues) => {
    try {
      await updateImpostazioni({
        impostazioni: values
      });
    } catch (error: any) {
      toast.error(`Si è verificato un errore: ${error.message}`);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <Tabs defaultValue="azienda" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-3">
            <TabsTrigger value="azienda">Dati Azienda</TabsTrigger>
            <TabsTrigger value="pagamenti">Metodi di Pagamento</TabsTrigger>
            <TabsTrigger value="iva">Aliquote IVA</TabsTrigger>
          </TabsList>
          
          <TabsContent value="azienda">
            <Card>
              <CardHeader>
                <CardTitle>Informazioni Aziendali</CardTitle>
              </CardHeader>
              <CardContent>
                <AziendaInfoForm />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pagamenti">
            <Card>
              <CardHeader>
                <CardTitle>Metodi di Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <MetodiPagamentoForm />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="iva">
            <Card>
              <CardHeader>
                <CardTitle>Aliquote IVA</CardTitle>
              </CardHeader>
              <CardContent>
                <AliquoteIvaForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? "Salvataggio..." : "Salva Impostazioni"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
