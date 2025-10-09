import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Building2, Calendar, MapPin, Info, ArrowLeft } from "lucide-react";

// Schema validazione
const servizioSchema = z.object({
  azienda_id: z.string().min(1, "Seleziona un'azienda"),
  data_servizio: z.string().min(1, "Inserisci la data del servizio"),
  orario_servizio: z.string().min(1, "Inserisci l'orario"),
  indirizzo_presa: z.string().min(1, "Inserisci l'indirizzo di partenza"),
  indirizzo_destinazione: z.string().min(1, "Inserisci l'indirizzo di destinazione"),
  metodo_pagamento: z.string().min(1, "Seleziona un metodo di pagamento"),
  citta_presa: z.string().optional(),
  citta_destinazione: z.string().optional(),
  numero_commessa: z.string().optional(),
  ore_previste: z.string().optional(),
  incasso_previsto: z.string().optional(),
  note: z.string().optional(),
});

type ServizioFormData = z.infer<typeof servizioSchema>;

export const ServizioCreaPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServizioFormData>({
    resolver: zodResolver(servizioSchema),
    defaultValues: {
      data_servizio: new Date().toISOString().split('T')[0],
      orario_servizio: "12:00",
    },
  });

  const onSubmit = async (data: ServizioFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implementare chiamata API per creare servizio
      console.log("Creazione servizio:", data);
      
      // Simulazione delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Servizio creato con successo!");
      navigate("/servizi");
    } catch (error) {
      console.error("Errore creazione servizio:", error);
      toast.error("Errore nella creazione del servizio");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/servizi")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna ai Servizi
        </Button>
        
        <h1 className="text-2xl md:text-3xl font-bold">Nuovo Servizio</h1>
        <p className="text-muted-foreground mt-1">
          Compila i campi per creare un nuovo servizio taxi/NCC
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-7xl">
        <div className="space-y-6">
          
          {/* SEZIONE 1: Azienda e Data */}
          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Azienda e Data Servizio</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Azienda */}
              <div className="space-y-2">
                <Label htmlFor="azienda_id">
                  Azienda <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="azienda_id"
                  placeholder="Seleziona azienda"
                  {...register("azienda_id")}
                />
                {errors.azienda_id && (
                  <p className="text-sm text-destructive">
                    {errors.azienda_id.message}
                  </p>
                )}
              </div>

              {/* Data Servizio */}
              <div className="space-y-2">
                <Label htmlFor="data_servizio">
                  Data Servizio <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="data_servizio"
                  type="date"
                  {...register("data_servizio")}
                />
                {errors.data_servizio && (
                  <p className="text-sm text-destructive">
                    {errors.data_servizio.message}
                  </p>
                )}
              </div>

              {/* Orario Servizio */}
              <div className="space-y-2">
                <Label htmlFor="orario_servizio">
                  Orario <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="orario_servizio"
                  type="time"
                  {...register("orario_servizio")}
                />
                {errors.orario_servizio && (
                  <p className="text-sm text-destructive">
                    {errors.orario_servizio.message}
                  </p>
                )}
              </div>

              {/* Numero Commessa */}
              <div className="space-y-2">
                <Label htmlFor="numero_commessa">Numero Commessa</Label>
                <Input
                  id="numero_commessa"
                  placeholder="ES-2024-001"
                  {...register("numero_commessa")}
                />
              </div>
            </div>
          </Card>

          {/* SEZIONE 2: Percorso */}
          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Percorso</h2>
            </div>
            
            <div className="space-y-6">
              {/* Partenza */}
              <div>
                <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                  Punto di Partenza
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="citta_presa">Città</Label>
                    <Input
                      id="citta_presa"
                      placeholder="Es: Milano"
                      {...register("citta_presa")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="indirizzo_presa">
                      Indirizzo Presa <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="indirizzo_presa"
                      placeholder="Es: Via Roma 123"
                      {...register("indirizzo_presa")}
                    />
                    {errors.indirizzo_presa && (
                      <p className="text-sm text-destructive">
                        {errors.indirizzo_presa.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Destinazione */}
              <div>
                <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                  Destinazione
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="citta_destinazione">Città</Label>
                    <Input
                      id="citta_destinazione"
                      placeholder="Es: Roma"
                      {...register("citta_destinazione")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="indirizzo_destinazione">
                      Indirizzo Destinazione <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="indirizzo_destinazione"
                      placeholder="Es: Aeroporto Fiumicino"
                      {...register("indirizzo_destinazione")}
                    />
                    {errors.indirizzo_destinazione && (
                      <p className="text-sm text-destructive">
                        {errors.indirizzo_destinazione.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* SEZIONE 3: Dettagli Operativi */}
          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Dettagli Operativi</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="metodo_pagamento">
                  Metodo Pagamento <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="metodo_pagamento"
                  placeholder="Es: Contanti, Bonifico"
                  {...register("metodo_pagamento")}
                />
                {errors.metodo_pagamento && (
                  <p className="text-sm text-destructive">
                    {errors.metodo_pagamento.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ore_previste">Ore Previste</Label>
                <Input
                  id="ore_previste"
                  type="number"
                  step="0.5"
                  placeholder="4.5"
                  {...register("ore_previste")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="incasso_previsto">Incasso Previsto (€)</Label>
                <Input
                  id="incasso_previsto"
                  type="number"
                  step="0.01"
                  placeholder="200.00"
                  {...register("incasso_previsto")}
                />
              </div>
            </div>

            {/* Note */}
            <div className="mt-4 space-y-2">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                placeholder="Note aggiuntive sul servizio..."
                rows={3}
                {...register("note")}
              />
            </div>
          </Card>

        </div>

        {/* Footer Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mt-8 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/servizi")}
            className="w-full sm:w-auto"
          >
            Annulla
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto min-w-[200px]"
          >
            {isSubmitting ? "Creazione in corso..." : "Crea Servizio"}
          </Button>
        </div>
      </form>
    </div>
  );
};
