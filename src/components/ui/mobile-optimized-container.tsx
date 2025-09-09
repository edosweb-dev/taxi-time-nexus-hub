import React from 'react';
import { cn } from '@/lib/utils';

interface MobileOptimizedContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  enableSafeArea?: boolean;
  preventHorizontalScroll?: boolean;
}

export function MobileOptimizedContainer({
  children,
  className = '',
  size = 'full',
  padding = 'md',
  enableSafeArea = true,
  preventHorizontalScroll = true
}: MobileOptimizedContainerProps) {
  
  const sizeClasses = {
    xs: 'max-w-xs mx-auto',
    sm: 'max-w-sm mx-auto',
    md: 'max-w-md mx-auto',
    lg: 'max-w-lg mx-auto',
    xl: 'max-w-xl mx-auto',
    full: 'w-full'
  };

  const paddingClasses = {
    none: '',
    xs: 'p-fluid-xs',
    sm: 'p-fluid-sm',
    md: 'p-fluid-md',
    lg: 'p-fluid-lg',
    xl: 'p-fluid-xl'
  };

  const safeAreaClasses = enableSafeArea ? 'safe-area-left safe-area-right' : '';
  const overflowClasses = preventHorizontalScroll ? 'overflow-x-hidden' : '';

  return (
    <div 
      className={cn(
        'w-full',
        sizeClasses[size],
        paddingClasses[padding],
        safeAreaClasses,
        overflowClasses,
        className
      )}
    >
      {children}
    </div>
  );
}

// Specialized mobile containers for common use cases
export function MobileCard({ 
  children, 
  className = '',
  ...props 
}: Omit<MobileOptimizedContainerProps, 'size'>) {
  return (
    <MobileOptimizedContainer 
      {...props}
      className={cn(
        'bg-card border border-border rounded-lg shadow-sm',
        'hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      {children}
    </MobileOptimizedContainer>
  );
}

export function MobileForm({ 
  children, 
  className = '',
  ...props 
}: Omit<MobileOptimizedContainerProps, 'size'>) {
  return (
    <MobileOptimizedContainer 
      {...props}
      className={cn(
        'space-y-fluid-md',
        className
      )}
    >
      {children}
    </MobileOptimizedContainer>
  );
}

export function MobileGrid({ 
  children, 
  className = '',
  cols = 1,
  ...props 
}: Omit<MobileOptimizedContainerProps, 'size'> & { cols?: 1 | 2 | 3 }) {
  const gridClasses = {
    1: 'grid grid-cols-1 gap-fluid-md',
    2: 'grid grid-cols-1 xs:grid-cols-2 gap-fluid-sm xs:gap-fluid-md',
    3: 'grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-fluid-sm sm:gap-fluid-md'
  };

  return (
    <MobileOptimizedContainer 
      {...props}
      className={cn(
        gridClasses[cols],
        className
      )}
    >
      {children}
    </MobileOptimizedContainer>
  );
}