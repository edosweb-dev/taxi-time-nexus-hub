import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { completaServizio } from "@/lib/api/servizi";
import { toast } from "@/components/ui/sonner";
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { Info } from "lucide-react";

const formSchema = z.object({
  incasso_ricevuto: z.coerce.number()
    .min(0.01, "Importo deve essere maggiore di 0")
    .positive("Importo deve essere un numero positivo"),
});

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
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      incasso_ricevuto: servizio.incasso_previsto || 0,
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      // VALIDAZIONE: Check firma cliente se obbligatoria
      if (servizio?.aziende?.firma_digitale_attiva && !servizio?.firma_url) {
        toast.error("Firma cliente mancante", {
          description: "Richiedi prima la firma del cliente prima di completare il servizio."
        });
        return;
      }

      const result = await completaServizio({
        id: servizio.id,
        metodo_pagamento: servizio.metodo_pagamento,
        incasso_ricevuto: data.incasso_ricevuto,
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
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Completa Servizio - {servizio.metodo_pagamento}</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Alert: Pagamento SENZA IVA */}
              <Alert className="border-primary/20 bg-primary/5">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Inserisci l'importo ricevuto dal cliente.
                  <br />
                  <strong>Nessuna IVA da aggiungere.</strong>
                </AlertDescription>
              </Alert>
              
              {/* Totale previsto (SENZA IVA) */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Totale previsto</label>
                <Input 
                  value={`€ ${totalePrevisto.toFixed(2)}`}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              {/* Incasso ricevuto */}
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
