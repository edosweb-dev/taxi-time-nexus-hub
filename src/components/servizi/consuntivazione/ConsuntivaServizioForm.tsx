
import React from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Profile } from "@/lib/types";
import { useConsuntivaServizioForm, ConsuntivaServizioFormData } from "../hooks/useConsuntivaServizioForm";
import { Servizio } from "@/lib/types/servizi";
import { useAuth } from "@/contexts/AuthContext";

interface ConsuntivaServizioFormProps {
  servizio: Servizio;
  adminUsers: { id: string; name: string }[];
  requiresConsegnaContanti: boolean;
  onSubmit: (data: ConsuntivaServizioFormData) => void;
  onCancel: () => void;
}

export function ConsuntivaServizioForm({
  servizio,
  adminUsers,
  requiresConsegnaContanti,
  onSubmit,
  onCancel,
}: ConsuntivaServizioFormProps) {
  const { form, handleSubmit, ivaPercentage, ivaAmount, totalePrevisto, isSubmitting } = useConsuntivaServizioForm(servizio, onSubmit);
  const { profile } = useAuth();
  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="incasso_previsto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Incasso previsto (€)</FormLabel>
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
                    value={field.value === undefined ? '' : field.value}
                    onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                  />
                </div>
              </FormControl>
              <FormDescription>
                {totalePrevisto && (
                  <span className="text-sm">
                    💡 Totale previsto (netto + IVA {ivaPercentage}%): <strong>€{totalePrevisto.toFixed(2)}</strong>
                  </span>
                )}
                {!totalePrevisto && (
                  <span className="text-sm text-muted-foreground">
                    Importo effettivamente ricevuto dal cliente
                  </span>
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo ore_finali RIMOSSO: usa solo ore_sosta */}

        {requiresConsegnaContanti && (
          <FormField
            control={form.control}
            name="consegna_contanti_a"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Consegna contanti a</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona un destinatario" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {adminUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* CAMPI EXTRA - Solo per admin/socio */}
        {isAdminOrSocio && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ore_sosta"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Ore di sosta</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="0"
                        {...field}
                        value={field.value === undefined ? '' : field.value}
                        onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Ore di attesa durante il servizio (usate per stipendio e fattura)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Campo KM - Solo se esecutore è admin/socio */}
            {(servizio as any).assegnato?.role === 'admin' || (servizio as any).assegnato?.role === 'socio' ? (
              <FormField
                control={form.control}
                name="km_totali"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Km percorsi</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="Es: 120"
                        {...field}
                        value={field.value === undefined ? '' : field.value}
                        onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Chilometri effettivamente percorsi (per calcolo stipendio)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
          </>
        )}
        
        {form.watch("incasso_previsto") !== undefined && (
          <div className="text-sm text-muted-foreground">
            <p>IVA ({ivaPercentage}%): €{ivaAmount.toFixed(2)}</p>
            <p className="font-medium mt-1">
              Totale: €{((form.watch("incasso_previsto") || 0) + ivaAmount).toFixed(2)}
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Annulla
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvataggio..." : "Consuntiva servizio"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
