import React from 'react';
import { cn } from '@/lib/utils';

export interface ResponsiveContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  as?: 'div' | 'section' | 'article' | 'main';
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  size = 'lg',
  className,
  as = 'div'
}) => {
  // Mobile-first responsive container sizes
  const sizeConfig = {
    sm: 'max-w-sm',       // 384px
    md: 'max-w-2xl',      // 672px
    lg: 'max-w-4xl',      // 896px
    xl: 'max-w-6xl',      // 1152px
    full: 'max-w-full'    // No constraint
  };

  const Element = as as keyof JSX.IntrinsicElements;
  
  return (
    <Element
      className={cn(
        'w-full mx-auto',
        sizeConfig[size],
        // Mobile-first padding system (consistent with MainLayout)
        'px-5 sm:px-4 md:px-6 lg:px-8',
        className
      )}
    >
      {children}
    </Element>
  );
};

export { ResponsiveContainer };