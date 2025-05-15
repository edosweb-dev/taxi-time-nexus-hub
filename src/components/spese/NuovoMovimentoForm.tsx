
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useMovimentoForm } from "./hooks/useMovimentoForm";
import {
  MovimentoDataField,
  MovimentoTipoField,
  MovimentoImportoField,
  MovimentoCausaleField,
  MovimentoPagamentoFields,
  MovimentoSocioFields,
  MovimentoNoteField
} from "./form-fields";

interface NuovoMovimentoFormProps {
  onMovimentoCreated?: () => void;
}

export function NuovoMovimentoForm({ onMovimentoCreated }: NuovoMovimentoFormProps) {
  const { 
    form, 
    metodiPagamento, 
    isLoadingMetodi, 
    soci, 
    isLoadingUsers,
    onSubmit 
  } = useMovimentoForm(onMovimentoCreated);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Registra Nuovo Movimento</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Data field */}
            <MovimentoDataField form={form} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo field */}
              <MovimentoTipoField form={form} />

              {/* Importo field */}
              <MovimentoImportoField form={form} />
            </div>

            {/* Causale field */}
            <MovimentoCausaleField form={form} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Metodo di pagamento e stato fields */}
              <MovimentoPagamentoFields 
                form={form}
                metodiPagamento={metodiPagamento}
                isLoadingMetodi={isLoadingMetodi}
              />
            </div>

            {/* Socio fields */}
            <MovimentoSocioFields
              form={form}
              soci={soci}
              isLoadingUsers={isLoadingUsers}
            />

            {/* Note field */}
            <MovimentoNoteField form={form} />
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Registrazione..." : "Registra Movimento"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
