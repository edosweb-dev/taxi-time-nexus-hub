import React from 'react';
import { Calendar, Euro, Map, Clock, TrendingUp, Users, Car } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: string;
}

interface ReportStatsProps {
  totalServizi: number;
  totalFatturato: number;
  totalKm: number;
  totalOre: number;
  serviziCompletati: number;
  conducentiAttivi: number;
  veicoliUtilizzati: number;
}

function StatCard({ title, value, icon, trend, color = "text-primary" }: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              {trend && (
                <span className="flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {trend}
                </span>
              )}
            </div>
          </div>
          <div className={`${color} p-3 rounded-full bg-muted/10`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReportStats({
  totalServizi,
  totalFatturato,
  totalKm,
  totalOre,
  serviziCompletati,
  conducentiAttivi,
  veicoliUtilizzati
}: ReportStatsProps) {
  // Calculate completion rate
  const completionRate = totalServizi > 0 ? Math.round((serviziCompletati / totalServizi) * 100) : 0;
  
  // Calculate average per service
  const avgPerService = totalServizi > 0 ? Math.round(totalFatturato / totalServizi) : 0;

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          title="Totale Servizi"
          value={totalServizi.toLocaleString('it-IT')}
          icon={<Calendar className="h-6 w-6" />}
          trend="+12% vs settimana scorsa"
          color="text-blue-600"
        />
        <StatCard 
          title="Fatturato"
          value={`€${totalFatturato.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
          icon={<Euro className="h-6 w-6" />}
          trend="+8% vs settimana scorsa"
          color="text-green-600"
        />
        <StatCard 
          title="Km Percorsi"
          value={`${totalKm.toLocaleString('it-IT')} km`}
          icon={<Map className="h-6 w-6" />}
          color="text-purple-600"
        />
        <StatCard 
          title="Ore Lavorate"
          value={`${totalOre.toLocaleString('it-IT')}h`}
          icon={<Clock className="h-6 w-6" />}
          color="text-orange-600"
        />
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Tasso Completamento"
          value={`${completionRate}%`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="text-emerald-600"
        />
        <StatCard 
          title="Conducenti Attivi"
          value={conducentiAttivi}
          icon={<Users className="h-6 w-6" />}
          color="text-indigo-600"
        />
        <StatCard 
          title="Veicoli Utilizzati"
          value={veicoliUtilizzati}
          icon={<Car className="h-6 w-6" />}
          color="text-cyan-600"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Media per servizio</span>
                  <span className="font-semibold">€{avgPerService}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Servizi completati</span>
                  <span className="font-semibold">{serviziCompletati}/{totalServizi}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Km medi per servizio</span>
                  <span className="font-semibold">
                    {totalServizi > 0 ? Math.round(totalKm / totalServizi) : 0} km
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Efficienza</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Ore medie per servizio</span>
                  <span className="font-semibold">
                    {totalServizi > 0 ? (totalOre / totalServizi).toFixed(1) : 0}h
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Utilizzo veicoli</span>
                  <span className="font-semibold">{Math.round((veicoliUtilizzati / 10) * 100)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Produttività</span>
                  <span className="font-semibold">
                    {conducentiAttivi > 0 ? Math.round(totalServizi / conducentiAttivi) : 0} serv/cond
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}