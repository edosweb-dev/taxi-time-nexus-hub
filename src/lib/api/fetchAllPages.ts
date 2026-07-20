/**
 * Scarica tutte le righe di una query PostgREST, superando il limite max_rows.
 *
 * PERCHE' SERVE: il progetto ha max_rows = 1000 (impostazione PostgREST). Una
 * query senza `.range()` non restituisce un errore quando le righe sono di
 * piu': ne restituisce mille e basta, in silenzio. Con `servizi` a 1.167 righe
 * ordinate per data decrescente, i 167 servizi piu' vecchi non arrivavano mai
 * al client. E' cosi' che TT-1197-2026 (28/02/2026) risultava introvabile
 * nella ricerca pur comparendo nel report aziende, che filtra per mese e resta
 * sotto il limite.
 *
 * Il problema peggiora da solo: ogni servizio nuovo ne spinge uno vecchio
 * oltre il taglio.
 *
 * COME SI USA: passa una funzione che costruisce la query applicando
 * `.range(from, to)`. Viene invocata una volta per pagina finche' non arriva
 * una pagina incompleta, che segnala la fine dei dati.
 *
 *   const servizi = await fetchAllPages((from, to) =>
 *     supabase.from('servizi').select('*').order('data_servizio').range(from, to)
 *   );
 *
 * NOTA: e' un rimedio, non l'assetto ideale. Caricare l'intera tabella nel
 * client resta costoso e cresce nel tempo; la direzione giusta e' spostare
 * filtri e ricerca lato database. Questo helper serve a non perdere dati
 * mentre quel lavoro non e' stato fatto.
 */

const DIMENSIONE_PAGINA = 1000;

/** Limite di sicurezza: 50 pagine, cioe' 50.000 righe. Evita cicli infiniti
 *  se una query restituisse sempre pagine piene. */
const MAX_PAGINE = 50;

export async function fetchAllPages<T>(
  buildQuery: (
    from: number,
    to: number
  ) => PromiseLike<{ data: T[] | null; error: unknown }>,
  dimensionePagina: number = DIMENSIONE_PAGINA
): Promise<T[]> {
  const risultati: T[] = [];

  for (let pagina = 0; pagina < MAX_PAGINE; pagina++) {
    const from = pagina * dimensionePagina;
    const to = from + dimensionePagina - 1;

    const { data, error } = await buildQuery(from, to);
    if (error) throw error;

    const righe = data ?? [];
    risultati.push(...righe);

    // Pagina incompleta: non c'e' altro da scaricare.
    if (righe.length < dimensionePagina) return risultati;
  }

  console.warn(
    `[fetchAllPages] Raggiunto il limite di ${MAX_PAGINE} pagine ` +
      `(${risultati.length} righe). Il risultato potrebbe essere incompleto.`
  );
  return risultati;
}
