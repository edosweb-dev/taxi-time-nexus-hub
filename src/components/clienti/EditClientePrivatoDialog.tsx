import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateClientePrivato } from "@/lib/api/clientiPrivati";
import { ClientePrivato } from "@/lib/types/servizi";
import { toast } from "sonner";

const clienteSchema = z.object({
  nome: z.string().min(1, "Nome obbligatorio"),
  cognome: z.string().min(1, "Cognome obbligatorio"),
  email: z.string().email("Email non valida").optional().or(z.literal('')),
  telefono: z.string().optional(),
  indirizzo: z.string().optional(),
  citta: z.string().optional(),
  note: z.string().optional(),
});

interface EditClientePrivatoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: ClientePrivato;
}

export function EditClientePrivatoDialog({ open, onOpenChange, cliente }: EditClientePrivatoDialogProps) {
  const queryClient = useQueryClient();
  
  const form = useForm({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nome: cliente.nome,
      cognome: cliente.cognome,
      email: cliente.email || "",
      telefono: cliente.telefono || "",
      indirizzo: cliente.indirizzo || "",
      citta: cliente.citta || "",
      note: cliente.note || "",
    },
  });

  const { mutate: update, isPending } = useMutation({
    mutationFn: (data: z.infer<typeof clienteSchema>) => updateClientePrivato(cliente.id, data),
    onSuccess: () => {
      toast.success("Cliente aggiornato con successo");
      queryClient.invalidateQueries({ queryKey: ['clienti-privati'] });
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Errore durante l'aggiornamento del cliente");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifica Cliente</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => update(data))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="nome" render={({ field }) => (
                <FormItem><FormLabel>Nome *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="cognome" render={({ field }) => (
                <FormItem><FormLabel>Cognome *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="telefono" render={({ field }) => (
                <FormItem><FormLabel>Telefono</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="indirizzo" render={({ field }) => (
              <FormItem><FormLabel>Indirizzo</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="citta" render={({ field }) => (
              <FormItem><FormLabel>Città</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="note" render={({ field }) => (
              <FormItem><FormLabel>Note</FormLabel><FormControl><Textarea {...field} className="min-h-[80px]" /></FormControl></FormItem>
            )} />
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annulla</Button>
              <Button type="submit" disabled={isPending}>{isPending ? "Salvataggio..." : "Salva"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
