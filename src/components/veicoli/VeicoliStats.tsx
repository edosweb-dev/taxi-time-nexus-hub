import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Users, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { Veicolo } from '@/lib/types/veicoli';
import { cn } from '@/lib/utils';

interface VeicoliStatsProps {
  veicoli: Veicolo[];
  onQuickFilter?: (filterType: string) => void;
}

export function VeicoliStats({ veicoli, onQuickFilter }: VeicoliStatsProps) {
  const stats = useMemo(() => {
    const totaleVeicoli = veicoli.length;
    const veicoliAttivi = veicoli.filter(v => v.attivo).length;
    const veicoliInattivi = totaleVeicoli - veicoliAttivi;
    const veicoliGrandi = veicoli.filter(v => (v.numero_posti || 0) >= 7).length;

    return {
      totaleVeicoli,
      veicoliAttivi,
      veicoliInattivi,
      veicoliGrandi,
    };
  }, [veicoli]);

  const statCards = [
    {
      title: "Totale Veicoli",
      value: stats.totaleVeicoli,
      icon: Car,
      iconColor: "text-muted-foreground",
      bgColor: "bg-muted",
      onClick: () => onQuickFilter?.('all')
    },
    {
      title: "Veicoli Attivi",
      value: stats.veicoliAttivi,
      icon: CheckCircle,
      iconColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      textColor: "text-green-600 dark:text-green-400",
      onClick: () => onQuickFilter?.('attivo')
    },
    {
      title: "Fuori Servizio",
      value: stats.veicoliInattivi,
      icon: AlertCircle,
      iconColor: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      textColor: "text-amber-600 dark:text-amber-400",
      onClick: () => onQuickFilter?.('inattivo')
    },
    {
      title: "Grandi (7+ posti)",
      value: stats.veicoliGrandi,
      icon: Users,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      textColor: "text-blue-600 dark:text-blue-400",
      onClick: () => onQuickFilter?.('7+')
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={index}
            className={cn(
              "transition-all duration-200",
              onQuickFilter && "cursor-pointer hover:shadow-md hover:border-primary/30 active:scale-95"
            )}
            onClick={stat.onClick}
            role={onQuickFilter ? "button" : undefined}
            tabIndex={onQuickFilter ? 0 : undefined}
            aria-label={onQuickFilter ? `Filtra per ${stat.title}` : undefined}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 pb-1">
              <div className={cn("p-1 rounded-md", stat.bgColor)}>
                <Icon className={cn("h-3 w-3", stat.iconColor)} />
              </div>
            </CardHeader>
            <CardContent className="p-2 pt-0">
              <div className={cn("text-lg font-bold mb-0.5", stat.textColor)}>
                {stat.value}
              </div>
              <p className="text-[9px] font-medium text-muted-foreground line-clamp-2 leading-tight">
                {stat.title}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}