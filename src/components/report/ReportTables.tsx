import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Building2, User, Car, Calendar, Euro, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface ReportTablesProps {
  servizi: any[];
  aziende: any[];
  conducenti: any[];
  veicoli: any[];
}

export function ReportTables({ servizi, aziende, conducenti, veicoli }: ReportTablesProps) {
  const [activeTab, setActiveTab] = useState('aziende');

  // Calcola statistiche per aziende
  const aziendaStats = aziende.map(azienda => {
    const aziendaServizi = servizi.filter(s => s.azienda_id === azienda.id);
    const fatturato = aziendaServizi.reduce((sum, s) => sum + (s.incasso_ricevuto || s.incasso_previsto || 0), 0);
    const ultimoServizio = aziendaServizi.sort((a, b) => new Date(b.data_servizio).getTime() - new Date(a.data_servizio).getTime())[0];
    
    return {
      id: azienda.id,
      nome: azienda.nome,
      email: azienda.email,
      telefono: azienda.telefono,
      referenti: azienda.referenti?.length || 0,
      serviziTotali: aziendaServizi.length,
      serviziCompletati: aziendaServizi.filter(s => s.stato === 'completato').length,
      fatturato,
      ultimoServizio: ultimoServizio ? format(new Date(ultimoServizio.data_servizio), 'dd/MM/yyyy', { locale: it }) : 'Mai'
    };
  }).filter(a => a.serviziTotali > 0).sort((a, b) => b.serviziTotali - a.serviziTotali);

  // Calcola statistiche per conducenti
  const conducenteStats = conducenti.map(conducente => {
    const conducenteServizi = servizi.filter(s => s.assegnato_a === conducente.id);
    const completati = conducenteServizi.filter(s => s.stato === 'completato');
    const oreLavorate = conducenteServizi.reduce((sum, s) => sum + (s.ore_effettive || 0), 0);
    const fatturato = completati.reduce((sum, s) => sum + (s.incasso_ricevuto || s.incasso_previsto || 0), 0);
    const ultimoServizio = conducenteServizi.sort((a, b) => new Date(b.data_servizio).getTime() - new Date(a.data_servizio).getTime())[0];
    
    return {
      id: conducente.id,
      nome: `${conducente.first_name} ${conducente.last_name}`,
      email: conducente.email,
      telefono: conducente.telefono,
      color: conducente.color,
      serviziTotali: conducenteServizi.length,
      serviziCompletati: completati.length,
      oreLavorate,
      rating: completati.length > 0 ? ((completati.length / conducenteServizi.length) * 5).toFixed(1) : '0.0',
      fatturato,
      ultimoServizio: ultimoServizio ? format(new Date(ultimoServizio.data_servizio), 'dd/MM/yyyy', { locale: it }) : 'Mai'
    };
  }).filter(c => c.serviziTotali > 0).sort((a, b) => b.serviziCompletati - a.serviziCompletati);

  // Calcola statistiche per veicoli
  const veicoloStats = veicoli.map(veicolo => {
    const veicoloServizi = servizi.filter(s => s.veicolo_id === veicolo.id);
    const kmPercorsi = veicoloServizi.length * 25; // Stima media 25km per servizio
    const oreUtilizzo = veicoloServizi.reduce((sum, s) => sum + (s.ore_effettive || 2), 0);
    const ultimoServizio = veicoloServizi.sort((a, b) => new Date(b.data_servizio).getTime() - new Date(a.data_servizio).getTime())[0];
    
    return {
      id: veicolo.id,
      targa: veicolo.targa,
      modello: veicolo.modello,
      anno: veicolo.anno,
      numeroPosti: veicolo.numero_posti,
      serviziTotali: veicoloServizi.length,
      kmPercorsi,
      oreUtilizzo,
      utilizzoGiornaliero: oreUtilizzo > 0 ? (oreUtilizzo / 30).toFixed(1) : '0.0', // Media ore/giorno ultimi 30gg
      ultimoServizio: ultimoServizio ? format(new Date(ultimoServizio.data_servizio), 'dd/MM/yyyy', { locale: it }) : 'Mai'
    };
  }).filter(v => v.serviziTotali > 0).sort((a, b) => b.serviziTotali - a.serviziTotali);

  const getRatingColor = (rating: string) => {
    const num = parseFloat(rating);
    if (num >= 4.5) return 'text-green-600';
    if (num >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tabelle Dettagliate</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="aziende" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Per Azienda
            </TabsTrigger>
            <TabsTrigger value="conducenti" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Per Conducente
            </TabsTrigger>
            <TabsTrigger value="veicoli" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Per Veicolo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="aziende" className="mt-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Azienda</TableHead>
                    <TableHead>Contatti</TableHead>
                    <TableHead className="text-center">Servizi</TableHead>
                    <TableHead className="text-center">Completati</TableHead>
                    <TableHead className="text-right">Fatturato</TableHead>
                    <TableHead className="text-center">Ultimo Servizio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aziendaStats.map((azienda) => (
                    <TableRow key={azienda.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{azienda.nome}</div>
                          <div className="text-sm text-muted-foreground">
                            {azienda.referenti} referenti
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {azienda.email && (
                            <div className="text-muted-foreground">{azienda.email}</div>
                          )}
                          {azienda.telefono && (
                            <div className="text-muted-foreground">{azienda.telefono}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{azienda.serviziTotali}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="default">{azienda.serviziCompletati}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        €{azienda.fatturato.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {azienda.ultimoServizio}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="conducenti" className="mt-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Conducente</TableHead>
                    <TableHead>Contatti</TableHead>
                    <TableHead className="text-center">Servizi</TableHead>
                    <TableHead className="text-center">Ore Lavorate</TableHead>
                    <TableHead className="text-center">Rating</TableHead>
                    <TableHead className="text-right">Fatturato</TableHead>
                    <TableHead className="text-center">Ultimo Servizio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conducenteStats.map((conducente) => (
                    <TableRow key={conducente.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {conducente.color && (
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: conducente.color }}
                            />
                          )}
                          <div className="font-medium">{conducente.nome}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {conducente.email && (
                            <div className="text-muted-foreground">{conducente.email}</div>
                          )}
                          {conducente.telefono && (
                            <div className="text-muted-foreground">{conducente.telefono}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="space-y-1">
                          <Badge variant="secondary">{conducente.serviziTotali}</Badge>
                          <div className="text-xs text-muted-foreground">
                            {conducente.serviziCompletati} completati
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{conducente.oreLavorate}h</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-medium ${getRatingColor(conducente.rating)}`}>
                          ★ {conducente.rating}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        €{conducente.fatturato.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {conducente.ultimoServizio}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="veicoli" className="mt-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Veicolo</TableHead>
                    <TableHead>Specifiche</TableHead>
                    <TableHead className="text-center">Servizi</TableHead>
                    <TableHead className="text-center">Km Percorsi</TableHead>
                    <TableHead className="text-center">Ore Utilizzo</TableHead>
                    <TableHead className="text-center">Media/Giorno</TableHead>
                    <TableHead className="text-center">Ultimo Servizio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {veicoloStats.map((veicolo) => (
                    <TableRow key={veicolo.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{veicolo.targa}</div>
                          <div className="text-sm text-muted-foreground">{veicolo.modello}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div>Anno: {veicolo.anno}</div>
                          <div>Posti: {veicolo.numeroPosti}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{veicolo.serviziTotali}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>{veicolo.kmPercorsi.toLocaleString('it-IT')} km</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{veicolo.oreUtilizzo}h</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-medium">{veicolo.utilizzoGiornaliero}h/g</span>
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {veicolo.ultimoServizio}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}