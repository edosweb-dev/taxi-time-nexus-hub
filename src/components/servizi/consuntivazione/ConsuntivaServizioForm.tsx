
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
  isContanti: boolean;
  onSubmit: (data: ConsuntivaServizioFormData) => void;
  onCancel: () => void;
}

export function ConsuntivaServizioForm({
  servizio,
  adminUsers,
  isContanti,
  onSubmit,
  onCancel,
}: ConsuntivaServizioFormProps) {
  const { form, handleSubmit, ivaPercentage, ivaAmount, isSubmitting } = useConsuntivaServizioForm(servizio, onSubmit);
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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ore_finali"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ore lavorate (finali)</FormLabel>
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
              <FormMessage />
            </FormItem>
          )}
        />

        {isContanti && (
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ore_sosta_fatturate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ore sosta fatturate</FormLabel>
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
                      Ore di sosta addebitate al cliente
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                  <FormMessage />
                </FormItem>
              )}
            />
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
