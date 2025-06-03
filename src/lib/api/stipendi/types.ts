export type { 
  Stipendio, 
  StipendioFormData, 
  TariffaKm, 
  ConfigurazioneStipendi,
  TipoCalcolo,
  StatoStipendio 
} from '@/lib/types/stipendi';

export interface StipendioCalculationResult {
  base_calcolo: number;
  coefficiente_applicato: number;
  totale_lordo: number;
  totale_netto: number;
  percentuale_su_totale?: number;
}

export type {
  CalcoloStipendioParams,
  CalcoloStipendioCompleto,
  DetrazioniStipendio
} from './calcolaStipendio';
