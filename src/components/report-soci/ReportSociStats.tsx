import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportSocioStats } from '@/lib/types/report-soci';
import { DollarSign, TrendingDown, TrendingUp, Users, Banknote, BarChart3 } from 'lucide-react';

interface ReportSociStatsCardProps {
  stats: ReportSocioStats | undefined;
}

export function ReportSociStatsCard({ stats }: ReportSociStatsCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const items = [
    {
      title: 'Totale Stipendi',
      value: stats?.totaleStipendi || 0,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Totale Prelievi',
      value: stats?.totalePrelievi || 0,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Totale Spese',
      value: stats?.totaleSpese || 0,
      icon: Banknote,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Totale Incassi',
      value: stats?.totaleIncassi || 0,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Numero Soci',
      value: stats?.numeroSoci || 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      isCurrency: false,
    },
    {
      title: 'Media Stipendio',
      value: stats?.mediaStipendio || 0,
      icon: BarChart3,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <Icon className={`h-4 w-4 ${item.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {item.isCurrency === false ? item.value : formatCurrency(item.value)}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
