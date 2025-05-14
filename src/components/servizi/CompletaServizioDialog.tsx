
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MetodoPagamento } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { completaServizio } from "@/lib/api/servizi";
import { useQuery } from "@tanstack/react-query";
import { getImpostazioni } from "@/lib/api/impostazioni/getImpostazioni";
import { MetodoPagamentoOption } from "@/lib/types/impostazioni";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  metodo_pagamento: z.string({
    required_error: "Seleziona un metodo di pagamento",
  }),
  incasso_ricevuto: z.coerce.number().min(0, "Deve essere un numero positivo").optional(),
  ore_lavorate: z.coerce.number().min(0, "Deve essere un numero positivo").optional(),
  consegna_contanti_a: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CompletaServizioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servizioId: string;
  metodoDefault: MetodoPagamento;
  onComplete: () => void;
  users: Profile[];
}

export function CompletaServizioDialog({
  open,
  onOpenChange,
  servizioId,
  metodoDefault,
  onComplete,
  users,
}: CompletaServizioDialogProps) {
  const [adminUsers, setAdminUsers] = useState<{ id: string; name: string }[]>([]);
  const [isContanti, setIsContanti] = useState(metodoDefault === 'Contanti');
  
  const { data: impostazioni, isLoading: impostazioniLoading } = useQuery({
    queryKey: ['impostazioni'],
    queryFn: getImpostazioni,
    enabled: open,
  });

  const metodiPagamento = impostazioni?.metodi_pagamento || [];

  useEffect(() => {
    if (users) {
      const filteredUsers = users
        .filter(user => user.role === 'admin' || user.role === 'socio')
        .map(user => ({
          id: user.id,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.id,
        }));
      setAdminUsers(filteredUsers);
    }
  }, [users]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      metodo_pagamento: metodoDefault,
      incasso_ricevuto: 0,
      ore_lavorate: 0,
      consegna_contanti_a: '',
    },
  });

  // Update the isContanti state when the metodo_pagamento value changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "metodo_pagamento") {
        setIsContanti(value.metodo_pagamento === "Contanti");
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(data: FormData) {
    try {
      const result = await completaServizio({
        id: servizioId,
        metodo_pagamento: data.metodo_pagamento,
        incasso_ricevuto: data.incasso_ricevuto,
        ore_lavorate: data.ore_lavorate,
        consegna_contanti_a: isContanti ? data.consegna_contanti_a : undefined,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Completa servizio</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
      </DialogContent>
    </Dialog>
  );
}
