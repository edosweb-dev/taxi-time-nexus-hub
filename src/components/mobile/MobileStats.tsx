import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface MobileStatItem {
  id: string;
  label: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
}

export interface MobileStatsProps {
  stats: MobileStatItem[];
  isLoading?: boolean;
  className?: string;
  columns?: 2 | 3 | 4;
}

const colorVariants = {
  default: {
    bg: 'bg-muted/50',
    text: 'text-foreground',
    icon: 'text-muted-foreground'
  },
  primary: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    icon: 'text-primary'
  },
  success: {
    bg: 'bg-success/10',
    text: 'text-success',
    icon: 'text-success'
  },
  warning: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    icon: 'text-warning'
  },
  destructive: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    icon: 'text-destructive'
  }
};

function StatSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-muted rounded animate-pulse" />
          <div className="h-6 bg-muted rounded animate-pulse w-16" />
          <div className="h-2 bg-muted rounded animate-pulse w-20" />
        </div>
        <div className="h-8 w-8 bg-muted rounded animate-pulse" />
      </div>
    </Card>
  );
}

export function MobileStats({ 
  stats, 
  isLoading = false, 
  className,
  columns = 2 
}: MobileStatsProps) {
  if (isLoading) {
    return (
      <div className={cn(
        "grid gap-3",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-3",
        columns === 4 && "grid-cols-2 sm:grid-cols-4",
        className
      )}>
        {Array.from({ length: 4 }).map((_, i) => (
          <StatSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn(
      "grid gap-3",
      columns === 2 && "grid-cols-2",
      columns === 3 && "grid-cols-3", 
      columns === 4 && "grid-cols-2 sm:grid-cols-4",
      className
    )}>
      {stats.map((stat) => {
        const colors = colorVariants[stat.color || 'default'];
        const Icon = stat.icon;
        
        return (
          <Card key={stat.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate mb-1">
                  {stat.label}
                </p>
                <p className={cn("text-lg font-semibold", colors.text)}>
                  {stat.value}
                </p>
                
                {stat.description && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {stat.description}
                  </p>
                )}
                
                {stat.trend && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className={cn(
                      "text-xs font-medium",
                      stat.trend.isPositive ? "text-success" : "text-destructive"
                    )}>
                      {stat.trend.isPositive ? "+" : ""}{stat.trend.value}
                    </span>
                  </div>
                )}
              </div>
              
              <div className={cn("p-2 rounded-lg", colors.bg)}>
                <Icon className={cn("h-4 w-4", colors.icon)} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}