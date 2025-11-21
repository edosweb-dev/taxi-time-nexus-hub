import React, { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from '@tanstack/react-query';
import { InfoAziendaForm } from "./InfoAziendaForm";
import { MetodiPagamentoForm } from "./MetodiPagamentoForm";
import { AliquoteIvaForm } from "./AliquoteIvaForm";
import { PagamentiAziendali } from "./PagamentiAziendali";
import { TariffeKmTab } from "./TariffeKmTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save } from "lucide-react";
import { ImpostazioniFormData, MetodoPagamentoOption, AliquotaIvaOption } from "@/lib/types/impostazioni";
import { updateImpostazioni } from "@/lib/api/impostazioni/updateImpostazioni";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/contexts/AuthContext";

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
      is_default: z.boolean().optional(),
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
  const { profile } = useAuth();
  const queryClient = useQueryClient();

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
      is_default: aliquota.is_default === true, // ✅ Preserva il flag default
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
      
      // Invalida cache per forzare re-fetch dei dati freschi
      await queryClient.invalidateQueries({ queryKey: ['impostazioni'] });
      
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
        <Tabs defaultValue="info" className="w-full">
          {/* Tabs ottimizzate per mobile - scrollabili orizzontalmente */}
          <TabsList className={`w-full grid ${(profile?.role === 'admin' || profile?.role === 'socio') ? 'grid-cols-3 md:grid-cols-5' : 'grid-cols-3'} gap-1 h-auto p-1`}>
            <TabsTrigger value="info" className="text-xs md:text-sm px-2 md:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <span className="hidden sm:inline">Informazioni Azienda</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger value="pagamenti" className="text-xs md:text-sm px-2 md:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <span className="hidden sm:inline">Metodi Pagamento</span>
              <span className="sm:hidden">Pagamenti</span>
            </TabsTrigger>
            <TabsTrigger value="iva" className="text-xs md:text-sm px-2 md:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <span className="hidden sm:inline">Aliquote IVA</span>
              <span className="sm:hidden">IVA</span>
            </TabsTrigger>
            {(profile?.role === 'admin' || profile?.role === 'socio') && (
              <TabsTrigger value="tariffe-km" className="text-xs md:text-sm px-2 md:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <span className="hidden sm:inline">Tariffe KM</span>
                <span className="sm:hidden">Tariffe</span>
              </TabsTrigger>
            )}
            {profile?.role === 'admin' && (
              <TabsTrigger value="pagamenti-aziendali" className="text-xs md:text-sm px-2 md:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground col-span-3 md:col-span-1">
                <span className="hidden sm:inline">Pagamenti Aziendali</span>
                <span className="sm:hidden">Pag. Aziendali</span>
              </TabsTrigger>
            )}
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

          {(profile?.role === 'admin' || profile?.role === 'socio') && (
            <TabsContent value="tariffe-km" className="mt-4">
              <TariffeKmTab />
            </TabsContent>
          )}

          {profile?.role === 'admin' && (
            <TabsContent value="pagamenti-aziendali" className="mt-4">
              <PagamentiAziendali />
            </TabsContent>
          )}
        </Tabs>

        {/* Bottone salva - Sticky su mobile */}
        <div className="sticky bottom-4 md:static flex justify-end pt-4 md:pt-0">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full md:w-auto shadow-lg md:shadow-none"
            size="lg"
          >
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
