import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './card';
import { TouchOptimizer } from './touch-optimizer';
import { useIsMobile } from '@/hooks/use-mobile';

export interface MobileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  touchOptimized?: boolean;
  spacing?: 'tight' | 'normal' | 'relaxed';
}

const MobileCard = React.forwardRef<HTMLDivElement, MobileCardProps>(
  ({ 
    className, 
    children, 
    interactive = false,
    touchOptimized = true,
    spacing = 'normal',
    ...props 
  }, ref) => {
    const isMobile = useIsMobile();
    
    // Spacing configurations optimized for mobile
    const spacingConfig = {
      tight: 'p-3 sm:p-4',
      normal: 'p-4 sm:p-6', 
      relaxed: 'p-6 sm:p-8'
    };

    const cardContent = (
      <Card
        ref={ref}
        className={cn(
          // Base responsive styling
          spacingConfig[spacing],
          // Mobile-specific optimizations
          isMobile && [
            'min-h-[60px]', // Ensure minimum touch area
            'transition-transform duration-200', // Smooth interactions
            interactive && 'active:scale-[0.98]' // Touch feedback
          ],
          // Interactive states
          interactive && [
            'cursor-pointer',
            'hover:shadow-md',
            'transition-shadow duration-200'
          ],
          className
        )}
        {...props}
      >
        {children}
      </Card>
    );

    // Wrap in TouchOptimizer if needed and on mobile
    if (touchOptimized && interactive && isMobile) {
      return (
        <TouchOptimizer minSize="lg" disabled={false}>
          {cardContent}
        </TouchOptimizer>
      );
    }

    return cardContent;
  }
);

MobileCard.displayName = "MobileCard";

export { MobileCard };