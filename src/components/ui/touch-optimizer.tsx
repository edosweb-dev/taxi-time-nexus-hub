import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export interface TouchOptimizerProps {
  children: React.ReactNode;
  minSize?: 'sm' | 'md' | 'lg'; // Touch target sizes
  className?: string;
  disabled?: boolean;
}

const TouchOptimizer: React.FC<TouchOptimizerProps> = ({
  children,
  minSize = 'md',
  className,
  disabled = false
}) => {
  const isMobile = useIsMobile();
  
  // Touch target size configurations (44px is iOS guideline minimum)
  const touchSizes = {
    sm: 'min-h-[40px] min-w-[40px]',   // 40px - compact elements
    md: 'min-h-[44px] min-w-[44px]',   // 44px - standard touch target
    lg: 'min-h-[48px] min-w-[48px]'    // 48px - primary actions
  };

  // Only apply touch optimizations on mobile and when not disabled
  const shouldOptimize = isMobile && !disabled;
  
  return (
    <div
      className={cn(
        // Base touch optimization classes
        shouldOptimize && [
          touchSizes[minSize],
          'flex items-center justify-center', // Center content in touch area
          'relative', // For potential focus rings
          'touch-manipulation', // Optimize for touch
        ],
        className
      )}
    >
      {children}
    </div>
  );
};

export { TouchOptimizer };