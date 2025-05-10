
import { MetodoPagamento, PasseggeroFormData } from "@/lib/types/servizi";

export interface ServizioInput {
  azienda_id: string;
  referente_id: string;
  numero_commessa?: string;
  data_servizio: string;
  metodo_pagamento: MetodoPagamento;
  note?: string;
}

export interface CreateServizioRequest {
  servizio: ServizioInput;
  passeggeri: PasseggeroFormData[];
}
