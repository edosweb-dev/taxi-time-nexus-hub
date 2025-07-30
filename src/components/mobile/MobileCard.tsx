import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface MobileCardAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  icon?: ReactNode;
}

export interface MobileCardProps {
  title: string;
  subtitle?: string;
  badge?: {
    label: string;
    variant?: 'default' | 'success' | 'destructive' | 'outline' | 'secondary';
  };
  content?: Array<{
    label: string;
    value: string | ReactNode;
    highlight?: boolean;
  }>;
  actions?: MobileCardAction[];
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}

export function MobileCard({
  title,
  subtitle,
  badge,
  content,
  actions,
  onClick,
  className,
  children
}: MobileCardProps) {
  return (
    <Card 
      className={cn(
        "p-4 transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-md active:scale-[0.98]",
        className
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-sm truncate">{title}</h3>
            {badge && (
              <Badge variant={badge.variant || 'default'} className="text-xs">
                {badge.label}
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      {content && content.length > 0 && (
        <div className="space-y-2 mb-3">
          {content.map((item, index) => (
            <div 
              key={index} 
              className={cn(
                "flex justify-between items-center text-xs",
                item.highlight && "bg-muted/50 -mx-2 px-2 py-1 rounded"
              )}
            >
              <span className="text-muted-foreground">{item.label}:</span>
              <span className={cn(
                "text-right font-medium",
                item.highlight && "text-primary"
              )}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Custom children content */}
      {children && (
        <div className="mb-3">
          {children}
        </div>
      )}

      {/* Actions */}
      {actions && actions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t" onClick={(e) => e.stopPropagation()}>
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                "hover:bg-muted active:scale-95",
                action.variant === 'destructive' && "text-destructive hover:bg-destructive/10",
                action.variant === 'outline' && "border border-border hover:bg-muted",
                action.variant === 'secondary' && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                (!action.variant || action.variant === 'default') && "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}