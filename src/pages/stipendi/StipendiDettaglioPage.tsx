import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, DollarSign, Calendar, FileText, CreditCard, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
    <div className="container mx-auto p-4 space-y-8">
      {/* Header con bottone indietro */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/stipendi')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Indietro
        </Button>
      </div>

      {/* Titolo pagina */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <DollarSign className="h-8 w-8" />
          Dettaglio Stipendio
        </h1>
        <div className="flex items-center gap-2 text-muted-foreground mt-2">
          <span className="font-medium">{utente?.first_name} {utente?.last_name}</span>
          <span>•</span>
          <Badge variant="secondary">{utente?.role}</Badge>
          <span>•</span>
          <span>{nomeMeseCorrente} {annoCorrente}</span>
        </div>
      </div>

      {/* 🎯 HERO SECTION - Stipendio da Erogare */}
      <Alert className={`border-2 ${totaleNetto >= 0 ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-red-500 bg-red-50 dark:bg-red-950/20'}`}>
        <AlertDescription>
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                💰 STIPENDIO DA EROGARE
              </p>
              <p className={`text-5xl md:text-6xl font-bold ${totaleNetto >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                €{totaleNetto.toFixed(2)}
              </p>
              {totaleNetto < 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Il collaboratore deve dare €{Math.abs(totaleNetto).toFixed(2)} all'azienda
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Paga ora
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Genera PDF
              </Button>
              <Button size="lg" variant="outline">
                Cronologia
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* 📊 Riepilogo Economico - 3 Colonne */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 💵 COMPENSI */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-400">
              💵 Compensi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">KM percorsi:</span>
              <span className="font-semibold">€{baseConAumento.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ore attesa:</span>
              <span className="font-semibold">€{importoOreSosta.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-green-700 dark:text-green-400">
              <span>Totale:</span>
              <span className="text-lg">€{totaleLordo.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* ➕ AGGIUNTE */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400">
              ➕ Aggiunte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Spese personali:</span>
              <span className="font-semibold text-green-600">+€{totaleSpesePersonali.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Riporto prec.:</span>
              <span className={`font-semibold ${riporto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {riporto >= 0 ? '+' : ''}€{riporto.toFixed(2)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-blue-700 dark:text-blue-400">
              <span>Totale:</span>
              <span className="text-lg">€{(totaleSpesePersonali + riporto).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* ➖ DETRAZIONI */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-red-700 dark:text-red-400">
              ➖ Detrazioni
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Prelievi:</span>
              <span className="font-semibold text-red-600">€{totalePrelievi.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Incassi dipendenti:</span>
              <span className="font-semibold text-red-600">€{totaleIncassiDipendenti.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Contanti:</span>
              <span className="font-semibold text-red-600">€{incassiContanti.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-red-700 dark:text-red-400">
              <span>Totale:</span>
              <span className="text-lg">€{(totalePrelievi + totaleIncassiDipendenti + incassiContanti).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 📊 Dati Statistici Mese */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📊 Dati Statistici Mese</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{servizi?.length || 0}</p>
              <p className="text-muted-foreground">Servizi</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{totaleKm.toFixed(0)} km</p>
              <p className="text-muted-foreground">Chilometri</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{totaleOreSosta.toFixed(1)}h</p>
              <p className="text-muted-foreground">Ore Attesa</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">€{totaleIncasso.toFixed(2)}</p>
              <p className="text-muted-foreground">Incasso Totale</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 📋 Tabella Servizi Semplificata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📋 Servizi del Mese ({servizi?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {servizi && servizi.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Servizio</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Azienda</TableHead>
                    <TableHead className="text-right">Incasso</TableHead>
                    <TableHead className="text-right">Dettagli</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servizi.map((servizio) => {
                    const km = Number(servizio.km_totali) || 0;
                    const oreSosta = Number(servizio.ore_sosta) || 0;
                    
                    return (
                      <TableRow key={servizio.id}>
                        <TableCell>
                          <Button
                            variant="link"
                            className="font-mono p-0 h-auto text-primary flex items-center gap-1"
                            onClick={() => navigate(`/servizi/${servizio.id}`)}
                          >
                            {servizio.id_progressivo || `TT-${servizio.id.slice(0, 3).toUpperCase()}-${annoCorrente}`}
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </TableCell>
                        <TableCell>
                          {new Date(servizio.data_servizio).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {servizio.aziende?.nome || '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          €{(Number(servizio.incasso_ricevuto) || Number(servizio.incasso_previsto) || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm text-muted-foreground">
                            {km > 0 && `${km.toFixed(0)}km`}
                            {km > 0 && oreSosta > 0 && ' · '}
                            {oreSosta > 0 && `${oreSosta.toFixed(1)}h`}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {/* Riga Totali */}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell colSpan={3} className="text-right">TOTALI:</TableCell>
                    <TableCell className="text-right">€{totaleIncasso.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm">
                        {totaleKm.toFixed(0)}km · {totaleOreSosta.toFixed(1)}h
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Nessun servizio consuntivato per questo mese
            </div>
          )}
        </CardContent>
      </Card>

      {/* ▶ Accordion - Calcolo Dettagliato */}
      <Accordion type="single" collapsible>
        <AccordionItem value="breakdown">
          <AccordionTrigger className="text-lg font-semibold">
            ▶ Mostra calcolo dettagliato
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6 space-y-4">
                {/* Calcolo Base */}
                <div>
                  <h3 className="font-semibold mb-3 text-base">1️⃣ Calcolo Base KM</h3>
                  <div className="space-y-2 text-sm pl-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        KM totali mese:
                      </span>
                      <span className="font-medium">{totaleKm.toFixed(0)} km</span>
                    </div>
                    {totaleKm <= 200 ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            KM arrotondati (tabella):
                          </span>
                          <span className="font-medium">{kmArrotondati} km</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Tariffa base (da tabella):
                          </span>
                          <span className="font-medium">€{baseKm.toFixed(2)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Calcolo lineare ({totaleKm.toFixed(0)} km × €{tariffaOltre200}):
                        </span>
                        <span className="font-medium">€{baseKm.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Coefficiente aumento (×{coefficienteAumento}):
                      </span>
                      <span className="font-medium">€{baseConAumento.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Calcolo Ore Sosta */}
                <div>
                  <h3 className="font-semibold mb-3 text-base">2️⃣ Calcolo Ore Attesa</h3>
                  <div className="space-y-2 text-sm pl-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Ore sosta totali:
                      </span>
                      <span className="font-medium">{totaleOreSosta.toFixed(1)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Tariffa oraria (€{tariffaOrariaAttesa}/h):
                      </span>
                      <span className="font-medium">€{importoOreSosta.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Totale Lordo */}
                <div>
                  <h3 className="font-semibold mb-3 text-base">3️⃣ Totale Lordo</h3>
                  <div className="space-y-2 text-sm pl-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Compenso KM + Ore Attesa:
                      </span>
                      <span className="font-bold text-lg">€{totaleLordo.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Detrazioni/Addizioni */}
                <div>
                  <h3 className="font-semibold mb-3 text-base">4️⃣ Aggiunte/Detrazioni</h3>
                  <div className="space-y-2 text-sm pl-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">➕ Spese personali approvate:</span>
                      <span className="font-medium text-green-600">+€{totaleSpesePersonali.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">➕ Riporto mese precedente:</span>
                      <span className={`font-medium ${riporto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {riporto >= 0 ? '+' : ''}€{riporto.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">➖ Prelievi:</span>
                      <span className="font-medium text-red-600">-€{totalePrelievi.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">➖ Incassi da dipendenti:</span>
                      <span className="font-medium text-red-600">-€{totaleIncassiDipendenti.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">➖ Incassi servizi contanti:</span>
                      <span className="font-medium text-red-600">-€{incassiContanti.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Totale Netto Finale */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">💎 TOTALE NETTO FINALE:</span>
                    <span className={`text-3xl font-bold ${totaleNetto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      €{totaleNetto.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
