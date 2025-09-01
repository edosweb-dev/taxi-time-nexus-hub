
import { MetodoPagamento, PasseggeroFormData, StatoServizio } from "@/lib/types/servizi";

export interface ServizioInput {
  azienda_id: string;
  referente_id: string;
  numero_commessa?: string;
  data_servizio: string;
  orario_servizio: string;
  indirizzo_presa: string;
  indirizzo_destinazione: string;
  citta_presa?: string;
  citta_destinazione?: string;
  metodo_pagamento: MetodoPagamento;
  note?: string;
  veicolo_id?: string;
  ore_effettive?: number;
  ore_fatturate?: number;
  applica_provvigione?: boolean;
  assegnato_a?: string;
  conducente_esterno?: boolean;
  conducente_esterno_nome?: string;
  conducente_esterno_email?: string;
  conducente_esterno_id?: string;
  stato?: StatoServizio;
}

export interface CreateServizioRequest {
  servizio: ServizioInput;
  passeggeri: PasseggeroFormData[];
}

export interface UpdateServizioRequest {
  servizio: ServizioInput & { id: string };
  passeggeri: PasseggeroFormData[];
}
