import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { completaServizio } from "@/lib/api/servizi";
import { checkAllPasseggeriSigned } from "@/lib/api/servizi/firmaPasseggero";
import { toast } from "@/components/ui/sonner";
import { Servizio } from "@/lib/types/servizi";
import { DollarSign } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const formSchema = z.object({
  incasso_ricevuto: z.coerce.number()
    .min(0, "Importo non può essere negativo"),
});

interface CompletaCartaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servizio: Servizio;
  onComplete: () => void;
}

export function CompletaCartaForm({
  open,
  onOpenChange,
  servizio,
  onComplete,
}: CompletaCartaFormProps) {
  const isMobile = useIsMobile();
  const ivaPercentuale = servizio.iva ?? 10;
  
  const totalePrevisto = servizio.incasso_previsto || 0;
  const imponibile = ivaPercentuale > 0 
    ? totalePrevisto / (1 + ivaPercentuale / 100) 
    : totalePrevisto;
  const ivaAmount = totalePrevisto - imponibile;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      incasso_ricevuto: totalePrevisto,
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      console.log('📊 [CompletaCartaForm] Submit data:', {
        metodo_pagamento: servizio.metodo_pagamento,
        incasso_previsto: servizio.incasso_previsto,
        incasso_ricevuto_input: data.incasso_ricevuto,
        iva_percentage: ivaPercentuale,
        totale_previsto_calculated: totalePrevisto,
      });
      
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

  console.log('[CompletaCartaForm] Calcolo totale:', {
    incasso_previsto: servizio.incasso_previsto,
    iva_percentuale: ivaPercentuale,
    importo_iva: ivaAmount,
    imponibile: imponibile,
    totale_con_iva: totalePrevisto,
  });

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
          <SheetTitle>Completa Servizio - Carta</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Alert className="border-primary/20 bg-primary/5">
                <DollarSign className="h-4 w-4" />
                <AlertDescription>
                  Inserisci l'importo ricevuto dal cliente.
                  <br />
                  <strong>Include IVA al {ivaPercentuale}%</strong>
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Imponibile:</span>
                  <span className="font-medium">€ {imponibile.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IVA ({ivaPercentuale}%):</span>
                  <span className="font-medium">€ {ivaAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Totale con IVA:</span>
                  <span className="text-primary">€ {totalePrevisto.toFixed(2)}</span>
                </div>
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
                        placeholder={totalePrevisto.toFixed(2)}
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
