
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, FileText, Calendar, User, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface ReportPreviewTableProps {
  aziendaId: string;
  referenteId?: string;
  year: number;
  month: number;
}

export function ReportPreviewTable({ 
  aziendaId, 
  referenteId, 
  year,
  month
}: ReportPreviewTableProps) {
  
  // Calcola primo e ultimo giorno del mese
  const dataInizio = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const dataFine = new Date(year, month, 0).toISOString().split('T')[0];

  console.log('ReportPreviewTable params:', { aziendaId, referenteId, year, month, dataInizio, dataFine });

  const { data: servizi = [], isLoading } = useQuery({
    queryKey: ['servizi-preview', aziendaId, referenteId, year, month],
    queryFn: async () => {
      console.log('Executing servizi query with params:', { aziendaId, referenteId, dataInizio, dataFine });
      
      let query = supabase
        .from('servizi')
        .select(`
          *,
          azienda:aziende!azienda_id(nome),
          referente:profiles!referente_id(first_name, last_name),
          assegnato:profiles!assegnato_a(first_name, last_name),
          veicolo:veicoli(modello, targa)
        `)
        .eq('azienda_id', aziendaId)
        .eq('stato', 'consuntivato')
        .gte('data_servizio', dataInizio)
        .lte('data_servizio', dataFine)
        .order('data_servizio', { ascending: false });

      if (referenteId && referenteId.trim() !== '') {
        console.log('Adding referente_id filter:', referenteId);
        query = query.eq('referente_id', referenteId);
      }

      const { data, error } = await query;
      console.log('Query result:', { data, error, count: data?.length });
      
      if (error) {
        console.error('Query error:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!aziendaId && !!year && !!month,
  });

  const getStatusBadge = (stato: string) => {
    switch (stato) {
      case 'completato':
        return <Badge variant="default" className="bg-green-500">Completato</Badge>;
      case 'assegnato':
        return <Badge variant="secondary">Assegnato</Badge>;
      case 'da_assegnare':
        return <Badge variant="outline">Da Assegnare</Badge>;
      case 'annullato':
        return <Badge variant="destructive">Annullato</Badge>;
      case 'consuntivato':
        return <Badge variant="default" className="bg-blue-500">Consuntivato</Badge>;
      default:
        return <Badge variant="outline">{stato}</Badge>;
    }
  };

  const getReferenteName = (referente: any) => {
    if (!referente) return 'Non specificato';
    
    if (Array.isArray(referente)) {
      const ref = referente[0];
      return ref ? `${ref.first_name} ${ref.last_name}` : 'Non specificato';
    }
    
    return `${referente.first_name} ${referente.last_name}`;
  };

  const getAssegnatoName = (assegnato: any) => {
    if (!assegnato) return null;
    
    if (Array.isArray(assegnato)) {
      const ass = assegnato[0];
      return ass ? `${ass.first_name} ${ass.last_name}` : null;
    }
    
    return `${assegnato.first_name} ${assegnato.last_name}`;
  };

  const totaleServizi = servizi.length;
  const totaleImponibile = servizi.reduce((sum, servizio) => 
    sum + (servizio.incasso_ricevuto || servizio.incasso_previsto || 0), 0
  );
  const totaleIva = totaleImponibile * 0.22;
  const totaleDocumento = totaleImponibile + totaleIva;

  const monthName = new Date(year, month - 1).toLocaleDateString('it-IT', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Anteprima Report Servizi
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {monthName}
              </span>
              <span>Azienda ID: {aziendaId}</span>
              {referenteId && <span>Referente ID: {referenteId}</span>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              {/* Riepilogo */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">{totaleServizi}</div>
                  <div className="text-sm text-muted-foreground">Servizi Consuntivati</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">€{totaleImponibile.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</div>
                  <div className="text-sm text-muted-foreground">Imponibile</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">€{totaleIva.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</div>
                  <div className="text-sm text-muted-foreground">IVA (22%)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">€{totaleDocumento.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</div>
                  <div className="text-sm text-muted-foreground">Totale</div>
                </div>
              </div>

              {/* Tabella servizi */}
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Orario</TableHead>
                      <TableHead>Referente</TableHead>
                      <TableHead>Percorso</TableHead>
                      <TableHead>Assegnato a</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead className="text-right">Importo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {servizi.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="text-muted-foreground">
                            <FileText className="mx-auto h-12 w-12 mb-2" />
                            <p>Nessun servizio consuntivato trovato per il mese selezionato</p>
                            <p className="text-xs mt-2">Parametri: {dataInizio} - {dataFine}</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      servizi.map((servizio) => (
                        <TableRow key={servizio.id}>
                          <TableCell>
                            {format(new Date(servizio.data_servizio), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell>
                            {servizio.orario_servizio}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {getReferenteName(servizio.referente)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-4 w-4" />
                              <div>
                                <div className="truncate max-w-[200px]">
                                  {servizio.indirizzo_presa}
                                </div>
                                <div className="text-muted-foreground truncate max-w-[200px]">
                                  → {servizio.indirizzo_destinazione}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const assegnatoName = getAssegnatoName(servizio.assegnato);
                              if (assegnatoName) {
                                return assegnatoName;
                              } else if (servizio.conducente_esterno) {
                                return servizio.conducente_esterno_nome;
                              } else {
                                return <span className="text-muted-foreground">Non assegnato</span>;
                              }
                            })()}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(servizio.stato)}
                          </TableCell>
                          <TableCell className="text-right">
                            €{(servizio.incasso_ricevuto || servizio.incasso_previsto || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
