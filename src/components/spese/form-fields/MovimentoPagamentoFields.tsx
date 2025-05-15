
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { MovimentoFormValues } from "../schemas/movimentoFormSchema";
import { MetodoPagamentoSpesa } from "@/lib/types/spese";

interface MovimentoPagamentoFieldsProps {
  form: UseFormReturn<MovimentoFormValues>;
  metodiPagamento: MetodoPagamentoSpesa[];
  isLoadingMetodi: boolean;
}

export function MovimentoPagamentoFields({ form, metodiPagamento, isLoadingMetodi }: MovimentoPagamentoFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="metodo_pagamento_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Metodo di pagamento</FormLabel>
            {isLoadingMetodi ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Caricamento...</span>
              </div>
            ) : (
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona metodo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {metodiPagamento.map((metodo) => (
                    <SelectItem key={metodo.id} value={metodo.id}>
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

      <FormField
        control={form.control}
        name="stato"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Stato pagamento</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona stato" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="saldato">Saldato</SelectItem>
                <SelectItem value="pending">Da saldare</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
