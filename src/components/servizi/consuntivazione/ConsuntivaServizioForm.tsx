
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
  servizio: Servizio & { assegnato?: { role?: string } };
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
  const { form, handleSubmit, ivaPercentage, ivaAmount, totaleRicevuto, isSubmitting } = useConsuntivaServizioForm(servizio, onSubmit);
  const { profile } = useAuth();
  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';
  
  // Determina se l'assegnato è un dipendente
  const assegnatoRole = servizio.assegnato?.role;
  const isAssegnatoToDipendente = assegnatoRole === 'dipendente';
  const isAssegnatoToSocio = assegnatoRole === 'admin' || assegnatoRole === 'socio';

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="incasso_ricevuto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Totale incassato (€)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...field}
                  value={field.value === undefined ? '' : field.value}
                  onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                {ivaPercentage > 0 && (
                  <span className="text-sm text-muted-foreground">
                    Importo totale (IVA {ivaPercentage}% inclusa)
                  </span>
                )}
                {ivaPercentage === 0 && (
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

        {/* CAMPI ORE - Differenziati per ruolo assegnato */}
        {isAdminOrSocio && (
          <>
            {/* Per DIPENDENTI: Ore lavorate + Ore fatturate */}
            {isAssegnatoToDipendente && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ore_effettive"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ore lavorate</FormLabel>
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
                        Ore effettive di lavoro del dipendente
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ore_sosta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ore fatturate</FormLabel>
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
                        Ore di attesa da fatturare al cliente
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Per SOCI/ADMIN: Ore di sosta + Km percorsi */}
            {isAssegnatoToSocio && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="ore_sosta"
                  render={({ field }) => (
                    <FormItem>
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
                        Ore di attesa durante il servizio
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              </div>
            )}
          </>
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
