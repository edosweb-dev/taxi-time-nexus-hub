import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MobileInput } from "@/components/ui/mobile-input";
import { Loader2 } from "lucide-react";

const quickAziendaSchema = z.object({
  nome: z.string().min(1, "Nome azienda obbligatorio"),
  partita_iva: z.string()
    .length(11, "La Partita IVA deve essere di 11 cifre")
    .regex(/^\d+$/, "La Partita IVA deve contenere solo numeri"),
  email: z.string().email("Email non valida").optional().or(z.literal("")),
  telefono: z.string().optional(),
});

export type AziendaQuickFormData = z.infer<typeof quickAziendaSchema>;

interface AziendaQuickFormProps {
  onSubmit: (data: AziendaQuickFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function AziendaQuickForm({ onSubmit, onCancel, isSubmitting }: AziendaQuickFormProps) {
  const form = useForm<AziendaQuickFormData>({
    resolver: zodResolver(quickAziendaSchema),
    defaultValues: {
      nome: "",
      partita_iva: "",
      email: "",
      telefono: "",
    },
  });

  const handleSubmit = (data: AziendaQuickFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Azienda *</FormLabel>
              <FormControl>
                <MobileInput
                  placeholder="Es. Azienda S.r.l."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="partita_iva"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Partita IVA *</FormLabel>
              <FormControl>
                <MobileInput
                  placeholder="11 cifre"
                  maxLength={11}
                  inputMode="numeric"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <MobileInput
                    type="email"
                    placeholder="email@azienda.it"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefono</FormLabel>
                <FormControl>
                  <MobileInput
                    type="tel"
                    placeholder="+39 ..."
                    inputMode="tel"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Annulla
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crea Azienda
          </Button>
        </div>
      </form>
    </Form>
  );
}
