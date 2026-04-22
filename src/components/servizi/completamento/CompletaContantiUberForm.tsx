import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { completaServizio } from "@/lib/api/servizi";
import { checkAllPasseggeriSigned } from "@/lib/api/servizi/firmaPasseggero";
import { toast } from "@/components/ui/sonner";
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { Info } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CompletaContantiUberFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servizio: Servizio;
  users: Profile[];
  onComplete: () => void;
}

export function CompletaContantiUberForm({
  open,
  onOpenChange,
  servizio,
  users,
  onComplete,
}: CompletaContantiUberFormProps) {
  const isMobile = useIsMobile();

  // Determina il ruolo del conducente assegnato
  const assegnato = users.find((u) => u.id === servizio.assegnato_a);
  const isConducenteSocioOrAdmin =
    assegnato?.role === 'admin' || assegnato?.role === 'socio';
  const isConducenteEsterno = servizio.conducente_esterno === true;
  
  // Mostra il campo solo se: non è socio/admin, o è esterno, o non c'è assegnazione
  const showConsegnaField = !isConducenteSocioOrAdmin || isConducenteEsterno || !servizio.assegnato_a;

  // Schema Zod condizionale
  const formSchema = showConsegnaField
    ? z.object({
        incasso_ricevuto: z.coerce.number().min(0, "Importo non può essere negativo"),
        consegna_contanti_a: z.string().uuid("Seleziona a chi vanno consegnati i contanti"),
      })
    : z.object({
        incasso_ricevuto: z.coerce.number().min(0, "Importo non può essere negativo"),
      });

  const responsabiliIncasso = users.filter(
    (u) => u.role === "admin" || u.role === "socio"
  );

  const defaultConsegna =
    assegnato && (assegnato.role === "socio" || assegnato.role === "admin")
      ? servizio.assegnato_a ?? ""
      : "";

  // Default values condizionali
  const defaultValues: any = { incasso_ricevuto: servizio.incasso_previsto || 0 };
  if (showConsegnaField) {
    defaultValues.consegna_contanti_a = defaultConsegna;
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      if (servizio?.aziende?.firma_digitale_attiva) {
        const firmaCheck = await checkAllPasseggeriSigned(servizio.id);
        
        if (firmaCheck.totalPasseggeri > 0 && !firmaCheck.allSigned) {
          toast.error("Firme passeggeri mancanti", {
            description: `${firmaCheck.firmati}/${firmaCheck.totalPasseggeri} passeggeri hanno firmato`
          });
          return;
        }
        
        if (firmaCheck.totalPasseggeri === 0 && !servizio?.firma_url) {
          toast.error("Firma cliente mancante", {
            description: "Richiedi prima la firma del cliente prima di completare il servizio."
          });
          return;
        }
      }

      const consegnaFinale = showConsegnaField
        ? (data as any).consegna_contanti_a
        : servizio.assegnato_a;

      const result = await completaServizio({
        id: servizio.id,
        metodo_pagamento: servizio.metodo_pagamento,
        incasso_ricevuto: data.incasso_ricevuto,
        consegna_contanti_a: consegnaFinale,
      });

      if (result.error) {
        throw result.error;
      }

      toast.success("Servizio completato con successo");
      onOpenChange(false);
      onComplete();
    } catch (error: any) {
      toast.error(`Errore: ${error.message || "Si è verificato un errore"}`);
    }
  }

  const totalePrevisto = servizio.incasso_previsto || 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={
          isMobile
            ? "rounded-t-2xl max-h-[85vh] overflow-y-auto px-6 pb-8"
            : "sm:max-w-[500px] overflow-y-auto"
        }
      >
        {isMobile && (
          <div className="flex justify-center pt-2 pb-4">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>
        )}

        <SheetHeader>
          <SheetTitle>Completa Servizio - {servizio.metodo_pagamento}</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Alert className="border-primary/20 bg-primary/5">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Inserisci l'importo ricevuto dal cliente.
                  <br />
                  <strong>Nessuna IVA da aggiungere.</strong>
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Totale previsto</label>
                <Input 
                  value={`€ ${totalePrevisto.toFixed(2)}`}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <FormField
                control={form.control}
                name="incasso_ricevuto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Incasso ricevuto (€)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder={totalePrevisto.toString()}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showConsegnaField && (
                <FormField
                  control={form.control}
                  // @ts-ignore - campo condizionale non nel tipo base
                  name="consegna_contanti_a"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consegna contanti a</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona responsabile incasso" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {responsabiliIncasso.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.first_name} {u.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            
              <Button
                type="submit" 
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Completamento..." : "Completa Servizio"}
              </Button>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
