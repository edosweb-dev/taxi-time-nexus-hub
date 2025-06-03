
export type TipoCalcolo = 'dipendente' | 'socio';
export type StatoStipendio = 'bozza' | 'confermato' | 'pagato';

export interface TariffaKm {
  id: string;
  km: number;
  tariffa_base: number;
  anno: number;
  created_at: string;
}

export interface ConfigurazioneStipendi {
  id: string;
  anno: number;
  coefficiente_aumento: number;
  tariffa_oraria_attesa: number;
  tariffa_km_extra: number;
  created_at: string;
  updated_at: string;
}

export interface Stipendio {
  id: string;
  user_id: string;
  mese: number;
  anno: number;
  tipo_calcolo: TipoCalcolo;
  totale_km: number | null;
  totale_ore_lavorate: number | null;
  totale_ore_attesa: number | null;
  base_calcolo: number | null;
  coefficiente_applicato: number | null;
  totale_lordo: number | null;
  totale_spese: number | null;
  totale_prelievi: number | null;
  incassi_da_dipendenti: number | null;
  riporto_mese_precedente: number | null;
  totale_netto: number | null;
  percentuale_su_totale: number | null;
  stato: StatoStipendio;
  note: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  // Relazioni
  user?: {
    first_name: string | null;
    last_name: string | null;
    role: string;
  };
}

export interface StipendioFormData {
  user_id: string;
  mese: number;
  anno: number;
  tipo_calcolo: TipoCalcolo;
  totale_km?: number;
  totale_ore_lavorate?: number;
  totale_ore_attesa?: number;
  totale_spese?: number;
  totale_prelievi?: number;
  incassi_da_dipendenti?: number;
  riporto_mese_precedente?: number;
  note?: string;
}
