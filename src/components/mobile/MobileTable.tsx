import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface MobileTableItem {
  id: string;
  primary: string;
  secondary?: string;
  status?: {
    label: string;
    variant: 'default' | 'success' | 'warning' | 'destructive';
  };
  actions?: ReactNode;
  details?: Array<{
    label: string;
    value: string | ReactNode;
  }>;
}

export interface MobileTableProps {
  items: MobileTableItem[];
  onItemClick?: (item: MobileTableItem) => void;
  className?: string;
  emptyMessage?: string;
}

const statusVariants = {
  default: 'bg-muted text-muted-foreground',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  destructive: 'bg-destructive/10 text-destructive border-destructive/20'
};

export function MobileTable({ 
  items, 
  onItemClick, 
  className,
  emptyMessage = "Nessun elemento disponibile" 
}: MobileTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => (
        <Card 
          key={item.id}
          className={cn(
            "p-4 transition-all duration-200",
            onItemClick && "cursor-pointer hover:shadow-md active:scale-[0.98]"
          )}
          onClick={() => onItemClick?.(item)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-sm truncate">{item.primary}</h3>
                {item.status && (
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium border",
                    statusVariants[item.status.variant]
                  )}>
                    {item.status.label}
                  </span>
                )}
              </div>
              
              {item.secondary && (
                <p className="text-xs text-muted-foreground truncate mb-2">
                  {item.secondary}
                </p>
              )}
              
              {item.details && item.details.length > 0 && (
                <div className="space-y-1">
                  {item.details.map((detail, index) => (
                    <div key={index} className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">{detail.label}:</span>
                      <span className="font-medium text-right">{detail.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {item.actions && (
              <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                {item.actions}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}