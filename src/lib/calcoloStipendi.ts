
import { TariffaKm, ConfigurazioneStipendi } from '@/lib/types/stipendi';

/**
 * Interfacce per i parametri di calcolo
 */
export interface CalcoloSocioParams {
  km: number;
  oreAttesa: number;
  coefficienteAumento: number;
  tariffaOrariaAttesa: number;
}

export interface CalcoloSocioResult {
  baseKm: number;
  baseConAumento: number;
  importoOreAttesa: number;
  totaleLordo: number;
}

/**
 * Trova la tariffa chilometrica più appropriata per i km specificati
 * @param km - Numero di chilometri
 * @param tariffe - Array delle tariffe disponibili
 * @returns La tariffa base corrispondente
 */
export function trovaTariffaKm(km: number, tariffe: TariffaKm[]): number {
  console.log(`[trovaTariffaKm] Cercando tariffa per ${km} km`);
  
  // Ordina le tariffe per km crescente
  const tariffeOrdinate = [...tariffe].sort((a, b) => a.km - b.km);
  
  // Cerca una tariffa esatta
  const tariffaEsatta = tariffeOrdinate.find(t => t.km === km);
  if (tariffaEsatta) {
    console.log(`[trovaTariffaKm] Trovata tariffa esatta: ${tariffaEsatta.tariffa_base}€ per ${km} km`);
    return tariffaEsatta.tariffa_base;
  }
  
  // Se non trova una tariffa esatta, cerca quella più vicina
  // Arrotonda ai multipli di 5 più vicini
  const kmArrotondato = Math.round(km / 5) * 5;
  const tariffaArrotondata = tariffeOrdinate.find(t => t.km === kmArrotondato);
  if (tariffaArrotondata) {
    console.log(`[trovaTariffaKm] Trovata tariffa arrotondata: ${tariffaArrotondata.tariffa_base}€ per ${kmArrotondato} km (richiesti ${km} km)`);
    return tariffaArrotondata.tariffa_base;
  }
  
  // Se ancora non trova, usa interpolazione lineare tra le due tariffe più vicine
  let tariffaInferiore = null;
  let tariffaSuperiore = null;
  
  for (const tariffa of tariffeOrdinate) {
    if (tariffa.km < km) {
      tariffaInferiore = tariffa;
    } else if (tariffa.km > km && !tariffaSuperiore) {
      tariffaSuperiore = tariffa;
      break;
    }
  }
  
  if (tariffaInferiore && tariffaSuperiore) {
    // Interpolazione lineare
    const rapporto = (km - tariffaInferiore.km) / (tariffaSuperiore.km - tariffaInferiore.km);
    const tariffaInterpolata = tariffaInferiore.tariffa_base + 
      (tariffaSuperiore.tariffa_base - tariffaInferiore.tariffa_base) * rapporto;
    
    console.log(`[trovaTariffaKm] Interpolazione tra ${tariffaInferiore.km}km (${tariffaInferiore.tariffa_base}€) e ${tariffaSuperiore.km}km (${tariffaSuperiore.tariffa_base}€): ${tariffaInterpolata.toFixed(2)}€`);
    return Number(tariffaInterpolata.toFixed(2));
  }
  
  // Se non trova nulla, usa la tariffa più vicina disponibile
  if (tariffaInferiore) {
    console.log(`[trovaTariffaKm] Usando tariffa inferiore più vicina: ${tariffaInferiore.tariffa_base}€ per ${tariffaInferiore.km} km`);
    return tariffaInferiore.tariffa_base;
  }
  
  if (tariffaSuperiore) {
    console.log(`[trovaTariffaKm] Usando tariffa superiore più vicina: ${tariffaSuperiore.tariffa_base}€ per ${tariffaSuperiore.km} km`);
    return tariffaSuperiore.tariffa_base;
  }
  
  throw new Error(`Nessuna tariffa trovata per ${km} km`);
}

/**
 * Calcola la base chilometrica per un determinato numero di km
 * @param km - Numero di chilometri
 * @param tariffe - Array delle tariffe chilometriche disponibili
 * @returns La base chilometrica in euro
 */
export function calcolaBaseKm(km: number, tariffe: TariffaKm[]): number {
  console.log(`[calcolaBaseKm] Calcolando base per ${km} km`);
  
  if (km <= 0) {
    console.log(`[calcolaBaseKm] Km <= 0, ritorno 0`);
    return 0;
  }
  
  // Se km <= 215, usa la tabella tariffe
  if (km <= 215) {
    const base = trovaTariffaKm(km, tariffe);
    console.log(`[calcolaBaseKm] Base da tabella per ${km} km: ${base}€`);
    return base;
  }
  
  // Se km > 215, applica formula km * 0.28
  const base = km * 0.28;
  console.log(`[calcolaBaseKm] Base da formula per ${km} km: ${base.toFixed(2)}€ (${km} * 0.28)`);
  return Number(base.toFixed(2));
}

/**
 * Calcola lo stipendio per un socio
 * @param params - Parametri di calcolo
 * @returns Oggetto con il breakdown del calcolo
 */
export function calcolaStipendioSocio(params: CalcoloSocioParams): CalcoloSocioResult {
  const { km, oreAttesa, coefficienteAumento, tariffaOrariaAttesa } = params;
  
  console.log(`[calcolaStipendioSocio] Parametri:`, {
    km,
    oreAttesa,
    coefficienteAumento,
    tariffaOrariaAttesa
  });
  
  // Per ora, creiamo tariffe mock per il test
  // In produzione, queste verranno passate come parametro
  const tariffeMock: TariffaKm[] = [
    { id: '1', km: 40, tariffa_base: 22.60, anno: 2025, created_at: '' },
    { id: '2', km: 230, tariffa_base: 64.40, anno: 2025, created_at: '' }
  ];
  
  // 1. Calcola base da km
  const baseKm = calcolaBaseKm(km, tariffeMock);
  
  // 2. Applica coefficiente di aumento
  const baseConAumento = Number((baseKm * (1 + coefficienteAumento)).toFixed(2));
  
  // 3. Calcola importo ore attesa
  const importoOreAttesa = Number((oreAttesa * tariffaOrariaAttesa).toFixed(2));
  
  // 4. Calcola totale lordo
  const totaleLordo = Number((baseConAumento + importoOreAttesa).toFixed(2));
  
  const risultato: CalcoloSocioResult = {
    baseKm,
    baseConAumento,
    importoOreAttesa,
    totaleLordo
  };
  
  console.log(`[calcolaStipendioSocio] Risultato:`, risultato);
  return risultato;
}

/**
 * Funzioni di test per verificare i calcoli
 */
export function testCalcoli(): void {
  console.log('=== TEST CALCOLI STIPENDI ===');
  
  // Test 1: 40km + 1h attesa = 41.44€
  console.log('\n--- Test 1: 40km + 1h attesa ---');
  const test1 = calcolaStipendioSocio({
    km: 40,
    oreAttesa: 1,
    coefficienteAumento: 0.17,
    tariffaOrariaAttesa: 15.00
  });
  
  console.log('Risultato Test 1:', test1);
  console.log('Atteso: ~41.44€, Ottenuto:', test1.totaleLordo + '€');
  
  // Test 2: 230km + 2h attesa = 105.35€
  console.log('\n--- Test 2: 230km + 2h attesa ---');
  const test2 = calcolaStipendioSocio({
    km: 230,
    oreAttesa: 2,
    coefficienteAumento: 0.17,
    tariffaOrariaAttesa: 15.00
  });
  
  console.log('Risultato Test 2:', test2);
  console.log('Atteso: ~105.35€, Ottenuto:', test2.totaleLordo + '€');
  
  console.log('\n=== FINE TEST ===');
}

// Esporta una versione semplificata per test rapidi
export function calcolaRapido(km: number, oreAttesa: number = 0): number {
  const risultato = calcolaStipendioSocio({
    km,
    oreAttesa,
    coefficienteAumento: 0.17,
    tariffaOrariaAttesa: 15.00
  });
  
  return risultato.totaleLordo;
}
