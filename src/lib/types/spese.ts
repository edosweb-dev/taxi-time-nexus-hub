
import { Profile } from "@/lib/types";

export type MovimentoTipo = 'spesa' | 'incasso' | 'prelievo';
export type MovimentoStato = 'saldato' | 'pending';

export interface MetodoPagamentoSpesa {
  id: string;
  nome: string;
  descrizione?: string | null;
  created_at: string;
}

export interface CategoriaSpesa {
  id: string;
  nome: string;
  descrizione?: string | null;
  created_at: string;
}

export interface SpesaPersonale {
  id: string;
  user_id: string;
  data: string;
  importo: number;
  causale: string;
  note?: string | null;
  convertita_aziendale: boolean;
  created_at: string;
  updated_at: string;
}

export interface MovimentoAziendale {
  id: string;
  data: string;
  importo: number;
  causale: string;
  note?: string | null;
  tipo: MovimentoTipo;
  metodo_pagamento_id?: string | null;
  stato?: MovimentoStato;
  effettuato_da_id?: string | null;
  servizio_id?: string | null;
  spesa_personale_id?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GetSpeseOptions {
  startDate?: string;
  endDate?: string;
  userId?: string;
}

export interface GetMovimentiOptions {
  startDate?: string;
  endDate?: string;
  tipo?: MovimentoTipo;
  stato?: MovimentoStato;
}
