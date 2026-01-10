
import React from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Info, DollarSign } from "lucide-react";
import { useCompletaServizioForm } from "../hooks/useCompletaServizioForm";
import { Profile } from "@/lib/types";
import { MetodoPagamentoOption } from "@/lib/types/impostazioni";
import { Servizio } from "@/lib/types/servizi";
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface CompletaServizioFormProps {
  servizioId: string;
  metodoDefault: string;
  onComplete: () => void;
  onOpenChange: (open: boolean) => void;
  users: Profile[];
  open: boolean;
  servizio: Servizio;
}

export function CompletaServizioForm({
  servizioId,
  metodoDefault,
  onComplete,
  onOpenChange,
  users,
  open,
  servizio,
}: CompletaServizioFormProps) {
  const {
    form,
    onSubmit,
    isSubmitting,
    metodiPagamento,
    impostazioniLoading,
    richiedeIncasso,
  } = useCompletaServizioForm({
    servizioId,
    metodoDefault,
    onComplete,
    onOpenChange,
    users,
    open,
    servizio,
  });

  // ✅ incasso_previsto è l'imponibile - calcola totale con IVA del servizio
  const incassoNetto = Number(servizio.incasso_previsto) || 0;
  
  // ✅ Default 10% come da specifiche (usa ?? per non trattare 0 come falsy)
  const ivaPercentuale = servizio.iva ?? 10;
  const importoIva = incassoNetto * (ivaPercentuale / 100);
  const totalePrevisto = incassoNetto + importoIva;
  
  // Log per debug
  console.log('[CompletaServizio] Calcolo totale:', {
    incasso_previsto: servizio.incasso_previsto,
    iva_percentuale: ivaPercentuale,
    iva_dal_servizio: servizio.iva,
    totale_calcolato: totalePrevisto,
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Info metodo pagamento */}
        <div className="space-y-2">
          <Label htmlFor="metodo_pagamento_readonly">Modalità di pagamento</Label>
          <div className="flex items-center gap-2">
            <Input
              id="metodo_pagamento_readonly"
              type="text"
              value={servizio.metodo_pagamento || 'Non specificato'}
              disabled
              className="bg-muted flex-1"
            />
            <Badge variant={richiedeIncasso ? 'default' : 'secondary'}>
              {richiedeIncasso ? 'Incasso richiesto' : 'Pagamento diretto'}
            </Badge>
          </div>
        </div>

        {/* Alert informativo differenziato */}
        {!richiedeIncasso ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Pagamento Diretto all'Azienda</AlertTitle>
            <AlertDescription>
              Il cliente effettuerà il pagamento con <strong>{servizio.metodo_pagamento?.toLowerCase()}</strong> direttamente all'azienda.
              <br />
              <span className="text-muted-foreground text-xs">
                L'importo sarà registrato in fase di consuntivazione.
              </span>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="default" className="border-primary/20 bg-primary/5">
            <DollarSign className="h-4 w-4" />
            <AlertTitle>Gestione Incasso Richiesta</AlertTitle>
            <AlertDescription>
              Hai ricevuto il pagamento in <strong>{servizio.metodo_pagamento?.toLowerCase()}</strong>. 
              Inserisci l'importo effettivamente ricevuto dal cliente.
            </AlertDescription>
          </Alert>
        )}

        {/* Totale previsto - sempre visibile */}
        {servizio.incasso_previsto && (
          <div className="space-y-2">
            <Label htmlFor="incasso_previsto_readonly">
              Totale previsto (IVA {ivaPercentuale}%)
            </Label>
            <Input
              id="incasso_previsto_readonly"
              type="text"
              value={formatCurrency(totalePrevisto)}
              disabled
              className="bg-muted"
            />
          </div>
        )}

        {/* Gestione incasso - SOLO per Contanti/Carta */}
        {richiedeIncasso && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="incasso_ricevuto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incasso ricevuto (€) *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        €
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="pl-8"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Importo effettivamente ricevuto dal cliente
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Annulla
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvataggio...
              </>
            ) : (
              'Completa servizio'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
