
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MetodoPagamento } from "@/lib/types/servizi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { completaServizio } from "@/lib/api/servizi";

const formSchema = z.object({
  metodo_pagamento: z.enum(["Contanti", "Carta", "Bonifico"], {
    required_error: "Seleziona un metodo di pagamento",
  }),
  incasso_ricevuto: z.coerce.number().min(0, "Deve essere un numero positivo").optional(),
  ore_lavorate: z.coerce.number().min(0, "Deve essere un numero positivo").optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CompletaServizioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servizioId: string;
  metodoDefault: MetodoPagamento;
  onComplete: () => void;
}

export function CompletaServizioDialog({
  open,
  onOpenChange,
  servizioId,
  metodoDefault,
  onComplete,
}: CompletaServizioDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      metodo_pagamento: metodoDefault,
      incasso_ricevuto: 0,
      ore_lavorate: 0,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(data: FormData) {
    try {
      const result = await completaServizio({
        id: servizioId,
        metodo_pagamento: data.metodo_pagamento,
        incasso_ricevuto: data.incasso_ricevuto,
        ore_lavorate: data.ore_lavorate,
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
                <FormItem className="space-y-3">
                  <FormLabel>Modalità di pagamento</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Contanti" id="contanti" />
                        <Label htmlFor="contanti">Contanti</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Carta" id="carta" />
                        <Label htmlFor="carta">Carta</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Bonifico" id="bonifico" />
                        <Label htmlFor="bonifico">Bonifico</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
