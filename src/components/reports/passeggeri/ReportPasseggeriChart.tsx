import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportPasseggeroRow } from '@/hooks/useReportPasseggeri';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ReportPasseggeriChartProps {
  data: ReportPasseggeroRow[];
}

export function ReportPasseggeriChart({ data }: ReportPasseggeriChartProps) {
  const chartData = useMemo(() => {
    // Data is already aggregated by service (one row per service)
    // Group by date
    const grouped = data.reduce((acc, s) => {
      const date = format(new Date(s.data_servizio), 'dd/MM');
      const sortKey = s.data_servizio; // Keep original for sorting
      if (!acc[date]) {
        acc[date] = { data: date, sortKey, importo: 0, servizi: 0 };
      }
      acc[date].importo += s.importo || 0;
      acc[date].servizi += 1;
      return acc;
    }, {} as Record<string, { data: string; sortKey: string; importo: number; servizi: number }>);

    return Object.values(grouped).sort((a, b) =>
      a.sortKey.localeCompare(b.sortKey)
    );
  }, [data]);

  if (data.length === 0) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Importi per giorno</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="data"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `€${value}`}
                width={60}
              />
              <Tooltip
                formatter={(value: number) => [`€${value.toFixed(2)}`, 'Importo']}
                labelFormatter={(label) => `Data: ${label}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar
                dataKey="importo"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          {chartData.length} {chartData.length === 1 ? 'giorno' : 'giorni'} con servizi
        </p>
      </CardContent>
    </Card>
  );
}
