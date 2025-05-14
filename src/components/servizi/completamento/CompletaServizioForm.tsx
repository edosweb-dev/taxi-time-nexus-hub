
import React from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useCompletaServizioForm } from "../hooks/useCompletaServizioForm";
import { Profile } from "@/lib/types";
import { MetodoPagamentoOption } from "@/lib/types/impostazioni";

interface CompletaServizioFormProps {
  servizioId: string;
  metodoDefault: string;
  onComplete: () => void;
  onOpenChange: (open: boolean) => void;
  users: Profile[];
  open: boolean;
}

export function CompletaServizioForm({
  servizioId,
  metodoDefault,
  onComplete,
  onOpenChange,
  users,
  open
}: CompletaServizioFormProps) {
  const {
    form,
    onSubmit,
    isSubmitting,
    isContanti,
    adminUsers,
    metodiPagamento,
    impostazioniLoading,
  } = useCompletaServizioForm({
    servizioId,
    metodoDefault,
    onComplete,
    onOpenChange,
    users,
    open
  });

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

        <FormField
          control={form.control}
          name="ore_lavorate"
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
