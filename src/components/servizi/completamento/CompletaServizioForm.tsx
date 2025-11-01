
import React from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useCompletaServizioForm } from "../hooks/useCompletaServizioForm";
import { Profile } from "@/lib/types";
import { MetodoPagamentoOption } from "@/lib/types/impostazioni";
import { Servizio } from "@/lib/types/servizi";
import { formatCurrency } from "@/lib/utils";

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
  } = useCompletaServizioForm({
    servizioId,
    metodoDefault,
    onComplete,
    onOpenChange,
    users,
    open,
    servizio,
  });

  // Calcola l'importo totale IVA compresa (se applicabile)
  const calculateTotaleIncasso = () => {
    const incassoPrevisto = Number(servizio.incasso_previsto) || 0;
    const iva = Number(servizio.iva) || 0;
    
    // Verifica che il metodo di pagamento abbia IVA applicabile
    const metodoCorrente = metodiPagamento.find(m => m.nome === servizio.metodo_pagamento);
    const ivaApplicabile = metodoCorrente?.iva_applicabile === true;
    
    if (iva > 0 && ivaApplicabile) {
      // Se c'è IVA E il metodo la prevede, aggiungi l'IVA all'importo netto
      const ivaAmount = incassoPrevisto * (iva / 100);
      return incassoPrevisto + ivaAmount;
    }
    
    // Altrimenti ritorna solo l'incasso previsto
    return incassoPrevisto;
  };

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="metodo_pagamento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modalità di pagamento</FormLabel>
              {impostazioniLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Caricamento metodi di pagamento...</span>
                </div>
              ) : (
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona metodo di pagamento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {metodiPagamento.map((metodo: MetodoPagamentoOption) => (
                      <SelectItem key={metodo.id} value={metodo.nome}>
                        {metodo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label htmlFor="incasso_previsto_readonly">Totale da incassare</Label>
          <Input
            id="incasso_previsto_readonly"
            type="text"
            value={formatCurrency(calculateTotaleIncasso())}
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
                  min="0"
                  placeholder="0.00"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
            {isSubmitting ? "Salvataggio..." : "Completa servizio"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
