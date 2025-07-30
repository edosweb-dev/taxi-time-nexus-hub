import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Servizio } from '@/lib/types/servizi';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Archive
} from 'lucide-react';

interface MobileServiziStatsProps {
  servizi: Servizio[];
  isLoading: boolean;
}

export function MobileServiziStats({ servizi, isLoading }: MobileServiziStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-6 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: 'Totali',
      count: servizi.length,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Da assegnare',
      count: servizi.filter(s => s.stato === 'da_assegnare').length,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      label: 'Completati',
      count: servizi.filter(s => s.stato === 'completato').length,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Annullati',
      count: servizi.filter(s => s.stato === 'annullato').length,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {stats.map((stat, index) => (
        <Card key={index} className="border-l-4 border-l-primary/20 w-full transition-all duration-200 hover:shadow-md active:scale-[0.98]">
          <CardContent className="p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wide truncate font-medium">
                  {stat.label}
                </p>
                <p className="text-xl font-bold text-foreground mt-1 md:text-2xl">
                  {stat.count}
                </p>
              </div>
              <div className={cn(
                "p-2.5 rounded-xl flex-shrink-0 transition-colors",
                stat.bgColor
              )}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}