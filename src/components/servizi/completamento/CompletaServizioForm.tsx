
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

  // Calcola l'importo totale IVA compresa
  const calculateTotaleIncasso = () => {
    const incassoPrevisto = Number(servizio.incasso_previsto) || 0;
    const iva = Number(servizio.iva) || 0;
    
    // Se il servizio ha IVA, calcolala sempre
    if (iva > 0) {
      const ivaAmount = incassoPrevisto * (iva / 100);
      return incassoPrevisto + ivaAmount;
    }
    
    // Altrimenti ritorna solo l'incasso previsto
    return incassoPrevisto;
  };

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

        {/* Alert informativo per bonifico/assegno */}
        {!richiedeIncasso && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Pagamento Diretto all'Azienda</AlertTitle>
            <AlertDescription>
              Il cliente effettuerà il pagamento con {servizio.metodo_pagamento?.toLowerCase()} direttamente all'azienda. 
              Non è necessario gestire l'incasso.
            </AlertDescription>
          </Alert>
        )}

        {/* Totale previsto - sempre visibile */}
        {servizio.incasso_previsto && (
          <div className="space-y-2">
            <Label htmlFor="incasso_previsto_readonly">Totale previsto</Label>
            <Input
              id="incasso_previsto_readonly"
              type="text"
              value={formatCurrency(calculateTotaleIncasso())}
              disabled
              className="bg-muted"
            />
          </div>
        )}

        {/* Incasso ricevuto - SOLO per Contanti/Carta */}
        {richiedeIncasso && (
          <>
            <Alert variant="default" className="border-primary/20 bg-primary/5">
              <DollarSign className="h-4 w-4" />
              <AlertTitle>Gestione Incasso Richiesta</AlertTitle>
              <AlertDescription>
                Hai ricevuto il pagamento in {servizio.metodo_pagamento?.toLowerCase()}. 
                Inserisci l'importo effettivamente ricevuto dal cliente.
              </AlertDescription>
            </Alert>

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
          </>
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
