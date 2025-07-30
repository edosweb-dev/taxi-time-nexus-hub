import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface DashboardGridProps {
  children: ReactNode;
  className?: string;
}

export function DashboardGrid({ children, className }: DashboardGridProps) {
  return (
    <div className={cn(
      // Mobile-first: stacked vertically with consistent spacing
      "space-y-4",
      // Desktop: responsive grid
      "md:space-y-0 md:grid md:gap-6 md:grid-cols-2 lg:grid-cols-3",
      className
    )}>
      {children}
    </div>
  );
}