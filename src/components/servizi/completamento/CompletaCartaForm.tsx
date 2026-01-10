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

const formSchema = z.object({
  incasso_ricevuto: z.coerce.number()
    .min(0.01, "Importo deve essere maggiore di 0")
    .positive("Importo deve essere un numero positivo"),
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
  const ivaPercentuale = servizio.iva ?? 10; // ✅ Default 10%, usa ?? per non trattare 0 come falsy
  
  // ✅ SEMANTICA CORRETTA:
  // - incasso_previsto = LORDO (totale IVA inclusa, salvato in fase di creazione)
  // - incasso_ricevuto = LORDO (totale effettivo, inserito in completamento)
  // Scorporiamo l'IVA dal LORDO per visualizzazione
  const totalePrevisto = servizio.incasso_previsto || 0;
  const imponibile = ivaPercentuale > 0 
    ? totalePrevisto / (1 + ivaPercentuale / 100) 
    : totalePrevisto;
  const ivaAmount = totalePrevisto - imponibile;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // ✅ Pre-compila con LORDO calcolato (il totale che l'operatore dovrebbe ricevere)
      incasso_ricevuto: totalePrevisto,
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      // 🔍 DEBUG LOG per tracciare dati completamento Carta
      console.log('📊 [CompletaCartaForm] Submit data:', {
        metodo_pagamento: servizio.metodo_pagamento,
        incasso_previsto: servizio.incasso_previsto,
        incasso_ricevuto_input: data.incasso_ricevuto,
        iva_percentage: ivaPercentuale,
        totale_previsto_calculated: totalePrevisto,
      });
      
      // VALIDAZIONE: Check firma cliente/passeggeri se obbligatoria
      if (servizio?.aziende?.firma_digitale_attiva) {
        const firmaCheck = await checkAllPasseggeriSigned(servizio.id);
        
        // Se ci sono passeggeri, controlla che tutti abbiano firmato
        if (firmaCheck.totalPasseggeri > 0 && !firmaCheck.allSigned) {
          toast.error("Firme passeggeri mancanti", {
            description: `${firmaCheck.firmati}/${firmaCheck.totalPasseggeri} passeggeri hanno firmato`
          });
          return;
        }
        
        // Fallback per servizi senza passeggeri (usa firma singola)
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
        // NO consegna_contanti_a per Carta
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
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Completa Servizio - Carta</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Alert: Pagamento CON IVA */}
              <Alert className="border-primary/20 bg-primary/5">
                <DollarSign className="h-4 w-4" />
                <AlertDescription>
                  Inserisci l'importo ricevuto dal cliente.
                  <br />
                  <strong>Include IVA al {ivaPercentuale}%</strong>
                </AlertDescription>
              </Alert>
              
              {/* Dettaglio calcolo IVA */}
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
