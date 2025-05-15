
import { z } from "zod";

export const movimentoFormSchema = z.object({
  data: z.date(),
  importo: z.coerce.number().positive({ message: "L'importo deve essere maggiore di zero" }),
  causale: z.string().min(3, { message: "La causale deve essere di almeno 3 caratteri" }),
  note: z.string().optional(),
  tipo: z.enum(["spesa", "incasso", "prelievo"]),
  metodo_pagamento_id: z.string().min(1, { message: "Seleziona un metodo di pagamento" }),
  stato: z.enum(["saldato", "pending"]),
  effettuato_da_id: z.string().optional(),
  è_effettuato_da_socio: z.boolean().default(false),
});

export type MovimentoFormValues = z.infer<typeof movimentoFormSchema>;

export const defaultMovimentoValues: Partial<MovimentoFormValues> = {
  data: new Date(),
  importo: 0,
  causale: "",
  note: "",
  tipo: "spesa",
  stato: "pending",
  è_effettuato_da_socio: false,
};
