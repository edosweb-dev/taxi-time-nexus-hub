
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { consuntivaServizio } from "@/lib/api/servizi";
import { Profile } from "@/lib/types";

const formSchema = z.object({
  incasso_previsto: z.coerce.number().min(0, "Deve essere un numero positivo").optional(),
  ore_finali: z.coerce.number().min(0, "Deve essere un numero positivo").optional(),
  consegna_contanti_a: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ConsuntivaServizioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servizioId: string;
  isContanti: boolean;
  incassoRicevuto?: number;
  oreLavorate?: number;
  users: Profile[];
  onComplete: () => void;
}

export function ConsuntivaServizioDialog({
  open,
  onOpenChange,
  servizioId,
  isContanti,
  incassoRicevuto = 0,
  oreLavorate = 0,
  users,
  onComplete,
}: ConsuntivaServizioDialogProps) {
  const [adminUsers, setAdminUsers] = useState<{ id: string; name: string }[]>([]);

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
      incasso_previsto: incassoRicevuto,
      ore_finali: oreLavorate,
      consegna_contanti_a: '',
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(data: FormData) {
    try {
      const result = await consuntivaServizio({
        id: servizioId,
        incasso_previsto: data.incasso_previsto,
        ore_finali: data.ore_finali,
        consegna_contanti_a: isContanti ? data.consegna_contanti_a : undefined,
      });

      if (result.error) {
        throw result.error;
      }

      toast.success("Servizio consuntivato con successo");
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
          <DialogTitle>Consuntiva servizio</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                {isSubmitting ? "Salvataggio..." : "Consuntiva servizio"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
