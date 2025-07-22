import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Servizio } from "@/lib/types/servizi";
import { 
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  DollarSign
} from "lucide-react";
import { useMemo } from "react";

interface ServizioStatsProps {
  servizi: Servizio[];
  isLoading?: boolean;
}

export const ServizioStats = ({ servizi, isLoading }: ServizioStatsProps) => {
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayServices = servizi.filter(s => {
      const serviceDate = new Date(s.data_servizio);
      serviceDate.setHours(0, 0, 0, 0);
      return serviceDate.getTime() === today.getTime();
    });

    const completedToday = todayServices.filter(s => s.stato === 'completato').length;
    const totalRevenue = servizi
      .filter(s => s.stato === 'completato' || s.stato === 'consuntivato')
      .reduce((sum, s) => sum + (Number(s.incasso_ricevuto) || 0), 0);

    return {
      total: servizi.length,
      today: todayServices.length,
      completedToday,
      daAssegnare: servizi.filter(s => s.stato === 'da_assegnare').length,
      assegnati: servizi.filter(s => s.stato === 'assegnato').length,
      completati: servizi.filter(s => s.stato === 'completato').length,
      annullati: servizi.filter(s => s.stato === 'annullato').length,
      totalRevenue
    };
  }, [servizi]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-7 w-16 bg-muted animate-pulse rounded mb-1" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Servizi Oggi</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.today}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>Completati: {stats.completedToday}</span>
            <Badge variant={stats.completedToday > 0 ? "default" : "secondary"} className="h-4 text-xs">
              {stats.today > 0 ? Math.round((stats.completedToday / stats.today) * 100) : 0}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Da Assegnare</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.daAssegnare}</div>
          <p className="text-xs text-muted-foreground">
            Richiedono assegnazione
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Corso</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.assegnati}</div>
          <p className="text-xs text-muted-foreground">
            Servizi assegnati
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ricavi</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">€{stats.totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Servizi completati
          </p>
        </CardContent>
      </Card>
    </div>
  );
};