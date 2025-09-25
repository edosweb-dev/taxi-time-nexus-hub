import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Tooltip, Legend } from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { it } from 'date-fns/locale';

interface ReportChartsProps {
  servizi: any[];
  aziende: any[];
  conducenti: any[];
  veicoli: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

export function ReportCharts({ servizi = [], aziende = [], conducenti = [], veicoli = [] }: ReportChartsProps) {
  // Dati per grafico temporale (ultimi 30 giorni)
  const timelineData = useMemo(() => {
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date()
    });

    return last30Days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayServizi = servizi.filter(s => s.data_servizio === dateStr);
      
      return {
        date: format(date, 'dd/MM', { locale: it }),
        servizi: dayServizi.length || 0,
        fatturato: dayServizi.reduce((sum, s) => {
          const incasso = Number(s.incasso_ricevuto || s.incasso_previsto || 0);
          return sum + (isNaN(incasso) ? 0 : incasso);
        }, 0)
      };
    });
  }, [servizi]);

  // Dati per pie chart aziende
  const aziendaData = useMemo(() => {
    const aziendaStats = aziende.map(azienda => {
      const aziendaServizi = servizi.filter(s => s.azienda_id === azienda.id);
      return {
        name: azienda.nome && azienda.nome.length > 15 ? azienda.nome.substring(0, 15) + '...' : (azienda.nome || 'N/A'),
        value: aziendaServizi.length || 0,
        fatturato: aziendaServizi.reduce((sum, s) => {
          const incasso = Number(s.incasso_ricevuto || s.incasso_previsto || 0);
          return sum + (isNaN(incasso) ? 0 : incasso);
        }, 0)
      };
    }).filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 aziende

    return aziendaStats;
  }, [servizi, aziende]);

  // Dati per bar chart conducenti
  const conducenteData = useMemo(() => {
    const conducenteStats = conducenti.map(conducente => {
      const conducenteServizi = servizi.filter(s => s.assegnato_a === conducente.id);
      const completati = conducenteServizi.filter(s => s.stato === 'completato').length;
      
      return {
        name: `${conducente.first_name || ''} ${conducente.last_name || ''}`.trim().length > 12 
          ? `${conducente.first_name || ''} ${conducente.last_name || ''}`.trim().substring(0, 12) + '...'
          : `${conducente.first_name || ''} ${conducente.last_name || ''}`.trim() || 'N/A',
        totali: conducenteServizi.length || 0,
        completati: completati || 0,
        ore: conducenteServizi.reduce((sum, s) => {
          const ore = Number(s.ore_effettive || 0);
          return sum + (isNaN(ore) ? 0 : ore);
        }, 0)
      };
    }).filter(item => item.totali > 0)
      .sort((a, b) => b.completati - a.completati);

    return conducenteStats;
  }, [servizi, conducenti]);

  // Dati per utilizzo veicoli
  const veicoliData = useMemo(() => {
    const veicoliStats = veicoli.map(veicolo => {
      const veicoloServizi = servizi.filter(s => s.veicolo_id === veicolo.id);
      const ore = veicoloServizi.reduce((sum, s) => {
        const oreValue = Number(s.ore_effettive || 2);
        return sum + (isNaN(oreValue) ? 2 : oreValue);
      }, 0); // Default 2h se non specificato
      
      return {
        name: veicolo.targa || 'N/A',
        servizi: veicoloServizi.length || 0,
        ore: ore || 0,
        utilizzo: ore > 0 ? Math.min((ore / (30 * 8)) * 100, 100) : 0 // Max 8h/giorno per 30 giorni
      };
    }).filter(item => item.servizi > 0)
      .sort((a, b) => b.utilizzo - a.utilizzo);

    return veicoliStats;
  }, [servizi, veicoli]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey === 'fatturato' ? `€${(Number(entry.value) || 0).toFixed(2)}` : (Number(entry.value) || 0)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Safety check for empty data
  if (!servizi.length) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center h-[200px]">
            <p className="text-muted-foreground">Nessun servizio disponibile per generare i grafici</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Andamento Servizi (Ultimi 30 giorni)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="servizi" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Servizi"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="fatturato" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Fatturato €"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart Aziende */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuzione Servizi per Azienda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={aziendaData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {aziendaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Servizi']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart Conducenti */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Conducenti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conducenteData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totali" fill="#8884d8" name="Totali" />
                  <Bar dataKey="completati" fill="#82ca9d" name="Completati" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Utilizzo Veicoli */}
      <Card>
        <CardHeader>
          <CardTitle>Utilizzo Veicoli</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={veicoliData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'utilizzo' ? `${(value as number)?.toFixed(1)}%` : value,
                    name === 'utilizzo' ? 'Utilizzo' : name === 'ore' ? 'Ore' : 'Servizi'
                  ]}
                />
                <Legend />
                <Bar dataKey="utilizzo" fill="#8884d8" name="Utilizzo %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}