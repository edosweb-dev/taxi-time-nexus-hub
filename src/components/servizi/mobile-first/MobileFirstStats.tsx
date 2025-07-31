import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Servizio } from '@/lib/types/servizi';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Archive
} from 'lucide-react';

interface MobileFirstStatsProps {
  servizi: Servizio[];
  isLoading: boolean;
}

export function MobileFirstStats({ servizi, isLoading }: MobileFirstStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-primary-foreground/10 rounded-lg p-3 animate-pulse">
            <div className="h-3 bg-primary-foreground/20 rounded mb-2"></div>
            <div className="h-6 bg-primary-foreground/20 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: 'Totali',
      count: servizi.length,
      icon: FileText,
      color: 'text-primary-foreground',
      bgColor: 'bg-primary-foreground/10'
    },
    {
      label: 'Da Assegnare',
      count: servizi.filter(s => s.stato === 'da_assegnare').length,
      icon: Clock,
      color: 'text-yellow-300',
      bgColor: 'bg-yellow-500/20'
    },
    {
      label: 'Completati',
      count: servizi.filter(s => s.stato === 'completato').length,
      icon: CheckCircle,
      color: 'text-green-300',
      bgColor: 'bg-green-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, index) => (
        <div key={index} className={cn(
          "rounded-lg p-3 border border-primary-foreground/10",
          stat.bgColor
        )}>
          <div className="flex items-center justify-between mb-1">
            <stat.icon className={cn("h-4 w-4", stat.color)} />
          </div>
          <div>
            <p className="text-2xl font-bold text-primary-foreground">
              {stat.count}
            </p>
            <p className="text-xs text-primary-foreground/80 uppercase tracking-wide">
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}