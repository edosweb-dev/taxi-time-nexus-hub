
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Report } from '@/lib/types/reports';
import { FileText, TrendingUp, Calendar, Euro } from 'lucide-react';

interface ReportStatsProps {
  reports: Report[];
}

export function ReportStats({ reports }: ReportStatsProps) {
  const completedReports = reports.filter(r => r.stato === 'completato');
  const totalServices = completedReports.reduce((sum, r) => sum + r.numero_servizi, 0);
  const totalRevenue = completedReports.reduce((sum, r) => sum + r.totale_documento, 0);
  const thisMonthReports = completedReports.filter(r => {
    const reportDate = new Date(r.created_at);
    const now = new Date();
    return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
  });

  const stats = [
    {
      title: 'Report Totali',
      value: completedReports.length.toString(),
      description: 'Report completati',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Servizi Processati',
      value: totalServices.toString(),
      description: 'Servizi nei report',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Questo Mese',
      value: thisMonthReports.length.toString(),
      description: 'Report generati',
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Fatturato Totale',
      value: `€${totalRevenue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
      description: 'Valore dei report',
      icon: Euro,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
