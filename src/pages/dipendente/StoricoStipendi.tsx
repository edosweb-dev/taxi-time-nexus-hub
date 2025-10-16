import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { Euro, Calendar } from 'lucide-react';

const MESI = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

export default function StoricoStipendi() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['storico-stipendi', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // Stipendi calcolati
      const { data: stipendi, error: stipendiError } = await supabase
        .from('stipendi')
        .select('*')
        .eq('user_id', user.id)
        .in('stato', ['confermato', 'pagato'])
        .order('anno', { ascending: false })
        .order('mese', { ascending: false });

      if (stipendiError) throw stipendiError;

      // Pagamenti ricevuti
      const { data: pagamenti, error: pagamentiError } = await supabase
        .from('spese_aziendali')
        .select(`
          *,
          modalita:modalita_pagamenti(nome)
        `)
        .eq('tipo_causale', 'stipendio')
        .eq('dipendente_id', user.id)
        .order('data_movimento', { ascending: false });

      if (pagamentiError) throw pagamentiError;

      return { stipendi: stipendi || [], pagamenti: pagamenti || [] };
    },
    enabled: !!user?.id,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-2">
            <Euro className="h-8 w-8" />
            Storico Stipendi
          </h1>
          <p className="text-muted-foreground text-lg">
            Visualizza i tuoi stipendi calcolati e i pagamenti ricevuti
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="stipendi">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="stipendi">
                  Stipendi Calcolati ({data?.stipendi.length || 0})
                </TabsTrigger>
                <TabsTrigger value="pagamenti">
                  Pagamenti Ricevuti ({data?.pagamenti.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="stipendi" className="mt-6">
                {data?.stipendi.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nessuno stipendio calcolato</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Periodo</TableHead>
                          <TableHead>Totale Lordo</TableHead>
                          <TableHead>Totale Netto</TableHead>
                          <TableHead>Ore Lavorate</TableHead>
                          <TableHead>Stato</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data?.stipendi.map((stip) => (
                          <TableRow key={stip.id}>
                            <TableCell className="font-medium">
                              {MESI[stip.mese - 1]} {stip.anno}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(Number(stip.totale_lordo || 0))}
                            </TableCell>
                            <TableCell className="font-bold text-green-600">
                              {formatCurrency(Number(stip.totale_netto || 0))}
                            </TableCell>
                            <TableCell>
                              {stip.totale_ore_lavorate ? `${stip.totale_ore_lavorate} h` : '-'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={stip.stato === 'pagato' ? 'default' : 'secondary'}>
                                {stip.stato === 'pagato' ? '✅ Pagato' : '⏳ Confermato'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pagamenti" className="mt-6">
                {data?.pagamenti.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Euro className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nessun pagamento ricevuto</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data Pagamento</TableHead>
                          <TableHead>Importo</TableHead>
                          <TableHead>Modalità</TableHead>
                          <TableHead>Causale</TableHead>
                          <TableHead>Note</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data?.pagamenti.map((pag) => (
                          <TableRow key={pag.id}>
                            <TableCell className="font-medium">
                              {format(parseISO(pag.data_movimento), 'dd MMMM yyyy', { locale: it })}
                            </TableCell>
                            <TableCell className="font-bold text-green-600">
                              {formatCurrency(Number(pag.importo))}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {pag.modalita?.nome || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {pag.causale}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                              {pag.note || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Riepilogo Totali */}
        {data && (data.stipendi.length > 0 || data.pagamenti.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Riepilogo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Stipendi Confermati</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(
                      data.stipendi
                        .filter(s => s.stato === 'confermato')
                        .reduce((sum, s) => sum + Number(s.totale_netto || 0), 0)
                    )}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Stipendi Pagati</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(
                      data.stipendi
                        .filter(s => s.stato === 'pagato')
                        .reduce((sum, s) => sum + Number(s.totale_netto || 0), 0)
                    )}
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Totale Pagamenti</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(
                      data.pagamenti.reduce((sum, p) => sum + Number(p.importo), 0)
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
