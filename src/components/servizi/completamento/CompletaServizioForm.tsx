
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

  // DEBUG LOG
  console.log('🔍 CompletaServizioForm DEBUG:', {
    metodoPagamento: servizio.metodo_pagamento,
    richiedeIncasso,
  });

  // Fetch soci/admin per campo consegna contanti
  const { data: soci } = useQuery({
    queryKey: ['soci-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .in('role', ['admin', 'socio'])
        .order('first_name');

      if (error) throw error;
      return data || [];
    },
    enabled: richiedeIncasso && open,
    staleTime: 5 * 60 * 1000,
  });

  // ✅ incasso_previsto è l'imponibile - calcola totale con IVA del servizio
  const incassoNetto = Number(servizio.incasso_previsto) || 0;
  
  // Recupera IVA con priorità: servizio.iva > aziende.iva > default 22%
  const getIvaServizio = (): number => {
    // 1. Prova campo diretto servizio.iva
    if (servizio.iva && servizio.iva > 0) {
      return Number(servizio.iva);
    }
    
    // 2. Prova campo azienda.iva (con type assertion sicura)
    const aziendaIva = (servizio.aziende as any)?.iva;
    if (aziendaIva && aziendaIva > 0) {
      return Number(aziendaIva);
    }
    
    // 3. Default 22% solo se non c'è niente
    return 22;
  };
  
  const ivaPercentuale = getIvaServizio();
  const importoIva = incassoNetto * (ivaPercentuale / 100);
  const totalePrevisto = incassoNetto + importoIva;
  
  // Log per debug
  console.log('[CompletaServizio] Calcolo totale:', {
    incasso_previsto: servizio.incasso_previsto,
    iva_percentuale: ivaPercentuale,
    iva_fonte: servizio.iva ? 'servizio.iva' : (servizio.aziende as any)?.iva ? 'aziende.iva' : 'default',
    totale_calcolato: totalePrevisto,
    servizio_iva_raw: servizio.iva,
    aziende_iva_raw: (servizio.aziende as any)?.iva
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

            {/* ✅ Campo visibile SOLO per Contanti */}
            {servizio.metodo_pagamento === 'Contanti' && (
              <FormField
                control={form.control}
                name="consegna_contanti_a"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consegna Contanti A *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona socio/admin..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {soci?.map((socio) => (
                          <SelectItem key={socio.id} value={socio.id}>
                            {socio.first_name} {socio.last_name}
                            {socio.role && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                {socio.role}
                              </Badge>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Indica il socio/admin a cui consegnare i contanti
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
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
