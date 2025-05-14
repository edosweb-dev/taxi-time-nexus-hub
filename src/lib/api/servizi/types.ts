
import { MetodoPagamento, PasseggeroFormData, StatoServizio } from "@/lib/types/servizi";

export interface ServizioInput {
  azienda_id: string;
  referente_id: string;
  numero_commessa?: string;
  data_servizio: string;
  orario_servizio: string;
  indirizzo_presa: string;
  indirizzo_destinazione: string;
  metodo_pagamento: MetodoPagamento;
  note?: string;
  assegnato_a?: string;
  conducente_esterno?: boolean;
  conducente_esterno_nome?: string;
  conducente_esterno_email?: string;
  stato?: StatoServizio;
  iva?: string; // Aggiungiamo il campo IVA
}

export interface CreateServizioRequest {
  servizio: ServizioInput;
  passeggeri: PasseggeroFormData[];
}
