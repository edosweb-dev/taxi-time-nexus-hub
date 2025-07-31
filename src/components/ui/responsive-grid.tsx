import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    wide?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  as?: 'div' | 'section' | 'article';
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3, wide: 3 },
  gap = 'md',
  className,
  as = 'div'
}) => {
  const isMobile = useIsMobile();
  
  // Gap configurations optimized for touch (minimum 16px on mobile)
  const gapConfig = {
    sm: 'gap-3 md:gap-4',      // 12px mobile, 16px desktop
    md: 'gap-4 md:gap-6',      // 16px mobile, 24px desktop  
    lg: 'gap-6 md:gap-8',      // 24px mobile, 32px desktop
    xl: 'gap-8 md:gap-12'      // 32px mobile, 48px desktop
  };

  // Build responsive grid classes
  const gridCols = [
    `grid-cols-${cols.mobile || 1}`,
    cols.tablet && `md:grid-cols-${cols.tablet}`,
    cols.desktop && `lg:grid-cols-${cols.desktop}`,
    cols.wide && `xl:grid-cols-${cols.wide}`
  ].filter(Boolean).join(' ');

  const Element = as as keyof JSX.IntrinsicElements;
  
  return (
    <Element
      className={cn(
        'grid w-full',
        gridCols,
        gapConfig[gap],
        // Mobile-first optimizations
        isMobile && 'min-h-0', // Prevent grid overflow on mobile
        className
      )}
    >
      {children}
    </Element>
  );
};

export { ResponsiveGrid };