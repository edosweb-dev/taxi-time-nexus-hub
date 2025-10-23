import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function StipendiDettaglioPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  // Mese e anno correnti
  const now = new Date();
  const meseCorrente = now.getMonth() + 1;
  const annoCorrente = now.getFullYear();
  const primoGiornoMese = new Date(annoCorrente, meseCorrente - 1, 1).toISOString().split('T')[0];
  const ultimoGiornoMese = new Date(annoCorrente, meseCorrente, 0).toISOString().split('T')[0];

  // Nome mese in italiano
  const nomiMesi = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
  const nomeMeseCorrente = nomiMesi[meseCorrente - 1];

  // Query 1: Dati utente
  const { data: utente, isLoading: isLoadingUtente } = useQuery({
    queryKey: ['utente', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role, stipendio_fisso')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Query 2: Servizi consuntivati del mese
  const { data: servizi, isLoading: isLoadingServizi } = useQuery({
    queryKey: ['servizi-stipendio', userId, meseCorrente, annoCorrente],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('servizi')
        .select(`
          id,
          id_progressivo,
          data_servizio,
          metodo_pagamento,
          incasso_ricevuto,
          incasso_previsto,
          km_totali,
          ore_sosta,
          ore_effettive,
          stato,
          aziende(nome)
        `)
        .eq('assegnato_a', userId)
        .in('stato', ['completato', 'consuntivato'])
        .gte('data_servizio', primoGiornoMese)
        .lte('data_servizio', ultimoGiornoMese)
        .order('data_servizio', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Query 3: Configurazione stipendi anno corrente
  const { data: configurazione } = useQuery({
    queryKey: ['configurazione-stipendi', annoCorrente],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configurazione_stipendi')
        .select('*')
        .eq('anno', annoCorrente)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  // Query 4: Tariffe KM fissi
  const { data: tariffeKm } = useQuery({
    queryKey: ['tariffe-km', annoCorrente],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tariffe_km_fissi')
        .select('*')
        .eq('anno', annoCorrente)
        .eq('attivo', true)
        .order('km', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Query 5: Spese personali approvate
  const { data: spesePersonali } = useQuery({
    queryKey: ['spese-personali', userId, meseCorrente, annoCorrente],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spese_dipendenti')
        .select('importo')
        .eq('user_id', userId)
        .eq('stato', 'approvata')
        .gte('data_spesa', primoGiornoMese)
        .lte('data_spesa', ultimoGiornoMese);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  // Query 6: Prelievi
  const { data: prelievi } = useQuery({
    queryKey: ['prelievi', userId, meseCorrente, annoCorrente],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spese_aziendali')
        .select('importo')
        .eq('socio_id', userId)
        .eq('tipologia', 'prelievo')
        .gte('data_movimento', primoGiornoMese)
        .lte('data_movimento', ultimoGiornoMese);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  // Query 7: Incassi da dipendenti
  const { data: incassiDipendenti } = useQuery({
    queryKey: ['incassi-dipendenti', userId, meseCorrente, annoCorrente],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spese_aziendali')
        .select('importo')
        .eq('socio_id', userId)
        .eq('tipologia', 'incasso')
        .gte('data_movimento', primoGiornoMese)
        .lte('data_movimento', ultimoGiornoMese);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  // Query 8: Riporto mese precedente
  const { data: riportoMesePrecedente } = useQuery({
    queryKey: ['riporto-stipendio', userId, meseCorrente - 1, annoCorrente],
    queryFn: async () => {
      const mesePrecedente = meseCorrente === 1 ? 12 : meseCorrente - 1;
      const annoPrecedente = meseCorrente === 1 ? annoCorrente - 1 : annoCorrente;

      const { data, error } = await supabase
        .from('stipendi')
        .select('totale_netto')
        .eq('user_id', userId)
        .eq('mese', mesePrecedente)
        .eq('anno', annoPrecedente)
        .in('stato', ['bozza', 'confermato', 'pagato'])
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data?.totale_netto || 0;
    },
    enabled: !!userId,
  });

  // Totali dai servizi
  const totaleKm = servizi?.reduce((sum, s) => sum + (Number(s.km_totali) || 0), 0) || 0;
  const totaleOreSosta = servizi?.reduce((sum, s) => sum + (Number(s.ore_sosta) || 0), 0) || 0;
  const totaleIncasso = servizi?.reduce((sum, s) => 
    sum + (Number(s.incasso_ricevuto) || Number(s.incasso_previsto) || 0), 0
  ) || 0;
  const incassiContanti = servizi
    ?.filter(s => s.metodo_pagamento === 'Contanti')
    .reduce((sum, s) => sum + (Number(s.incasso_ricevuto) || Number(s.incasso_previsto) || 0), 0) || 0;

  // Parametri configurazione
  const coefficienteAumento = Number(configurazione?.coefficiente_aumento) || 1.17;
  const tariffaOrariaAttesa = Number(configurazione?.tariffa_oraria_attesa) || 15.0;
  const tariffaOltre200 = Number(configurazione?.tariffa_oltre_200km) || 0.25;

  // 1. Calcolo Base KM
  let baseKm = 0;
  let kmArrotondati = totaleKm;
  
  if (totaleKm <= 200) {
    // Arrotondamento KM
    if (totaleKm > 12) {
      kmArrotondati = Math.round(totaleKm / 5) * 5;
    } else if (totaleKm < 12) {
      kmArrotondati = 12;
    }

    // Lookup tabella
    const tariffa = tariffeKm?.find(t => t.km === kmArrotondati);
    baseKm = Number(tariffa?.importo_base) || 0;
  } else {
    // Calcolo lineare per KM > 200
    baseKm = totaleKm * tariffaOltre200;
  }

  // 2. Base con aumento
  const baseConAumento = baseKm * coefficienteAumento;

  // 3. Importo ore sosta
  const importoOreSosta = totaleOreSosta * tariffaOrariaAttesa;

  // 4. Totale lordo
  const totaleLordo = baseConAumento + importoOreSosta;

  // 5. Detrazioni/Addizioni
  const totaleSpesePersonali = spesePersonali?.reduce((sum, s) => sum + Number(s.importo), 0) || 0;
  const totalePrelievi = prelievi?.reduce((sum, p) => sum + Number(p.importo), 0) || 0;
  const totaleIncassiDipendenti = incassiDipendenti?.reduce((sum, i) => sum + Number(i.importo), 0) || 0;
  const riporto = Number(riportoMesePrecedente) || 0;

  // 6. Totale netto
  const totaleNetto = Number((
    totaleLordo +
    totaleSpesePersonali -
    totalePrelievi -
    totaleIncassiDipendenti -
    incassiContanti +
    riporto
  ).toFixed(2));

  // Funzioni helper per calcolo compenso singolo servizio
  const calcolaCompensoKmServizio = (km: number): number => {
    if (km <= 200) {
      // Arrotondamento
      let kmArr = km;
      if (km > 12) {
        kmArr = Math.round(km / 5) * 5;
      } else if (km < 12) {
        kmArr = 12;
      }
      
      // Lookup tabella
      const tariffa = tariffeKm?.find(t => t.km === kmArr);
      const baseKm = Number(tariffa?.importo_base) || 0;
      
      // Applica coefficiente
      return baseKm * coefficienteAumento;
    } else {
      // Calcolo lineare per KM > 200
      const baseKm = km * tariffaOltre200;
      return baseKm * coefficienteAumento;
    }
  };

  const calcolaCompensoOreSosta = (ore: number): number => {
    return ore * tariffaOrariaAttesa;
  };

  const isLoading = isLoadingUtente || isLoadingServizi;

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/stipendi')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Indietro
        </Button>
      </div>

      {/* Titolo */}
      <div>
        <h1 className="text-2xl font-bold">Dettaglio Stipendio</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <span>{utente?.first_name} {utente?.last_name}</span>
          <span>•</span>
          <Badge variant="secondary">{utente?.role}</Badge>
          <span>•</span>
          <span>{nomeMeseCorrente} {annoCorrente}</span>
        </div>
      </div>

      {/* Riepilogo Totale */}
      <Card className={`${totaleNetto >= 0 ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'}`}>
        <CardHeader>
          <CardTitle className="text-lg">Stipendio da Erogare</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-3xl font-bold">
                <span className={totaleNetto >= 0 ? 'text-green-600' : 'text-red-600'}>
                  €{totaleNetto.toFixed(2)}
                </span>
              </p>
              {totaleNetto < 0 && (
                <p className="text-sm text-muted-foreground">
                  Il collaboratore deve dare €{Math.abs(totaleNetto).toFixed(2)}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm">Paga ora</Button>
              <Button size="sm" variant="outline">PDF</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Riepilogo Economico */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Compensi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>KM percorsi</span>
              <span className="font-semibold">€{baseConAumento.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Ore attesa</span>
              <span className="font-semibold">€{importoOreSosta.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold">
              <span>Totale</span>
              <span className="text-green-600">€{totaleLordo.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aggiunte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Spese personali</span>
              <span className="font-semibold text-green-600">€{totaleSpesePersonali.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Riporto prec.</span>
              <span className={`font-semibold ${riporto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                €{riporto.toFixed(2)}
              </span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold">
              <span>Totale</span>
              <span className="text-blue-600">€{(totaleSpesePersonali + riporto).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Detrazioni</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Prelievi</span>
              <span className="font-semibold text-red-600">€{totalePrelievi.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Inc. dipendenti</span>
              <span className="font-semibold text-red-600">€{totaleIncassiDipendenti.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Contanti</span>
              <span className="font-semibold text-red-600">€{incassiContanti.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold">
              <span>Totale</span>
              <span className="text-red-600">€{(totalePrelievi + totaleIncassiDipendenti + incassiContanti).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dati Statistici */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Riepilogo Mensile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-2xl font-bold">{servizi?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Servizi</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{totaleKm.toFixed(0)}</p>
              <p className="text-sm text-muted-foreground">Km totali</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{totaleOreSosta.toFixed(1)}h</p>
              <p className="text-sm text-muted-foreground">Ore attesa</p>
            </div>
            <div>
              <p className="text-2xl font-bold">€{totaleIncasso.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Incasso</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabella Servizi con Compensi Dettagliati */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dettaglio Servizi ({servizi?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {servizi && servizi.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">ID</TableHead>
                    <TableHead className="w-[80px]">Data</TableHead>
                    <TableHead>Azienda</TableHead>
                    <TableHead className="text-right w-[100px]">Incasso</TableHead>
                    <TableHead className="text-right w-[140px]">KM (Compenso)</TableHead>
                    <TableHead className="text-right w-[140px]">Ore (Compenso)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servizi.map((servizio) => {
                    const km = Number(servizio.km_totali) || 0;
                    const oreSosta = Number(servizio.ore_sosta) || 0;
                    const compensoKm = calcolaCompensoKmServizio(km);
                    const compensoOreSosta = calcolaCompensoOreSosta(oreSosta);
                    
                    return (
                      <TableRow key={servizio.id} className="hover:bg-muted/50">
                        <TableCell>
                          <Button
                            variant="link"
                            className="p-0 h-auto font-mono text-xs"
                            onClick={() => navigate(`/servizi/${servizio.id}`)}
                          >
                            {servizio.id_progressivo || `TT-${servizio.id.slice(0, 3)}-${annoCorrente}`}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(servizio.data_servizio).toLocaleDateString('it-IT', { 
                            day: '2-digit', 
                            month: '2-digit' 
                          })}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm">
                          {servizio.aziende?.nome || '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          €{(Number(servizio.incasso_ricevuto) || Number(servizio.incasso_previsto) || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="space-y-0.5">
                            <div className="font-medium">{km.toFixed(0)} km</div>
                            <div className="text-xs text-muted-foreground">€{compensoKm.toFixed(2)}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="space-y-0.5">
                            <div className="font-medium">{oreSosta.toFixed(1)}h</div>
                            <div className="text-xs text-muted-foreground">€{compensoOreSosta.toFixed(2)}</div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell colSpan={3}>TOTALI</TableCell>
                    <TableCell className="text-right">€{totaleIncasso.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="space-y-0.5">
                        <div>{totaleKm.toFixed(0)} km</div>
                        <div className="text-sm text-green-600">€{baseConAumento.toFixed(2)}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="space-y-0.5">
                        <div>{totaleOreSosta.toFixed(1)}h</div>
                        <div className="text-sm text-green-600">€{importoOreSosta.toFixed(2)}</div>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8 text-sm">
              Nessun servizio consuntivato per questo mese
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dettagli Calcolo (Collapsabile) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dettagli Calcolo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2">Compenso KM</h4>
            <div className="space-y-1 pl-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">KM totali:</span>
                <span>{totaleKm.toFixed(0)} km</span>
              </div>
              {totaleKm <= 200 ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">KM arrotondati:</span>
                    <span>{kmArrotondati} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tariffa base:</span>
                    <span>€{baseKm.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Calcolo lineare ({totaleKm.toFixed(0)} × €{tariffaOltre200}):</span>
                  <span>€{baseKm.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium">
                <span className="text-muted-foreground">Con coefficiente {coefficienteAumento}:</span>
                <span>€{baseConAumento.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-semibold mb-2">Compenso Ore Attesa</h4>
            <div className="space-y-1 pl-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ore totali:</span>
                <span>{totaleOreSosta.toFixed(1)}h</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-muted-foreground">A €{tariffaOrariaAttesa}/h:</span>
                <span>€{importoOreSosta.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
