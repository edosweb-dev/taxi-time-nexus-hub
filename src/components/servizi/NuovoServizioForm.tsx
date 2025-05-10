
import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useServizi } from "@/hooks/useServizi";
import { ServizioFormData, MetodoPagamento } from "@/lib/types/servizi";
import { toast } from "@/components/ui/sonner";
import { AziendaSelectField } from "./AziendaSelectField";
import { PasseggeroForm } from "./PasseggeroForm";

const servizioFormSchema = z.object({
  azienda_id: z.string().min(1, "Azienda obbligatoria"),
  referente_id: z.string().optional(),
  numero_commessa: z.string().optional(),
  data_servizio: z.string().min(1, "Data servizio obbligatoria"),
  metodo_pagamento: z.enum(["Contanti", "Carta", "Bonifico"], {
    required_error: "Metodo di pagamento obbligatorio",
  }),
  note: z.string().optional(),
  passeggeri: z.array(
    z.object({
      nome_cognome: z.string().min(1, "Nome e cognome obbligatorio"),
      email: z.string().email("Email non valida").optional().or(z.literal('')),
      telefono: z.string().optional(),
      orario_presa: z.string().min(1, "Orario di presa obbligatorio"),
      luogo_presa: z.string().min(1, "Luogo di presa obbligatorio"),
      usa_indirizzo_personalizzato: z.boolean().default(false),
      destinazione: z.string().min(1, "Destinazione obbligatoria"),
    })
  ).min(1, "Aggiungi almeno un passeggero"),
});

export function NuovoServizioForm() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { createServizio, isCreating } = useServizi();

  const form = useForm<ServizioFormData>({
    resolver: zodResolver(servizioFormSchema),
    defaultValues: {
      azienda_id: "",
      referente_id: profile?.id,
      numero_commessa: "",
      data_servizio: new Date().toISOString().split("T")[0],
      metodo_pagamento: "Bonifico" as MetodoPagamento,
      note: "",
      passeggeri: [],
    },
  });

  // Se l'utente è un cliente, imposta l'azienda_id di default
  useEffect(() => {
    if (profile?.role === "cliente" && profile?.azienda_id) {
      form.setValue("azienda_id", profile.azienda_id);
    }
  }, [profile, form]);

  const onSubmit = async (values: ServizioFormData) => {
    try {
      if (!profile) {
        toast.error("Utente non autenticato");
        return;
      }

      // Se è un cliente, assicuriamoci che referente_id sia impostato
      const referente_id = values.referente_id || profile.id;

      await createServizio({
        servizio: {
          azienda_id: values.azienda_id,
          referente_id,
          numero_commessa: values.numero_commessa,
          data_servizio: values.data_servizio,
          metodo_pagamento: values.metodo_pagamento,
          note: values.note,
        },
        passeggeri: values.passeggeri,
      });

      navigate("/servizi");
    } catch (error: any) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Azienda Select Field */}
              {profile?.role === "cliente" && profile?.azienda_id ? (
                <FormField
                  control={form.control}
                  name="azienda_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Azienda</FormLabel>
                      <FormControl>
                        <Input value="La tua azienda" disabled />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ) : (
                <AziendaSelectField />
              )}

              {/* Numero Commessa */}
              <FormField
                control={form.control}
                name="numero_commessa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numero Commessa</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ABC123" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Data del servizio */}
              <FormField
                control={form.control}
                name="data_servizio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data del servizio *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Metodo di pagamento */}
              <FormField
                control={form.control}
                name="metodo_pagamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metodo di pagamento *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona un metodo di pagamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Contanti">Contanti</SelectItem>
                        <SelectItem value="Carta">Carta</SelectItem>
                        <SelectItem value="Bonifico">Bonifico</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Note */}
            <div className="mt-4">
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note aggiuntive</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Inserisci eventuali note o informazioni aggiuntive"
                        className="min-h-[100px] resize-y"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Passeggeri */}
        <PasseggeroForm />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Annulla
          </Button>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? "Creazione in corso..." : "Crea servizio"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
