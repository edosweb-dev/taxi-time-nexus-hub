import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';

interface DashboardGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    wide?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

export function DashboardGrid({ 
  children, 
  className, 
  cols = { mobile: 1, tablet: 2, desktop: 3, wide: 3 },
  gap = 'lg'
}: DashboardGridProps) {
  return (
    <ResponsiveGrid
      cols={cols}
      gap={gap}
      className={className}
    >
      {children}
    </ResponsiveGrid>
  );
}