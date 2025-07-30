import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface DashboardGridProps {
  children: ReactNode;
  className?: string;
}

export function DashboardGrid({ children, className }: DashboardGridProps) {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      isMobile 
        ? "space-y-4" // Mobile: stacked vertically with consistent spacing
        : "grid gap-6 md:grid-cols-2 lg:grid-cols-3", // Desktop: responsive grid
      className
    )}>
      {children}
    </div>
  );
}