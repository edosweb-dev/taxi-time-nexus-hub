import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileButtonProps extends ButtonProps {
  touchOptimized?: boolean;
  fluid?: boolean;
}

export function MobileButton({ 
  children, 
  className = '',
  touchOptimized = true,
  fluid = false,
  ...props 
}: MobileButtonProps) {
  return (
    <Button
      {...props}
      className={cn(
        // Touch-optimized sizing
        touchOptimized && 'min-h-touch min-w-touch',
        // Fluid width on mobile
        fluid && 'w-full xs:w-auto',
        // Enhanced mobile spacing
        'px-fluid-lg py-fluid-sm',
        // Better text sizing
        'text-fluid-text-base',
        // Improved touch feedback
        'active:scale-95 transition-transform duration-150',
        // No text selection
        'no-select',
        className
      )}
    >
      {children}
    </Button>
  );
}

// Specialized mobile button variants
export function MobilePrimaryButton(props: MobileButtonProps) {
  return <MobileButton {...props} variant="default" />;
}

export function MobileSecondaryButton(props: MobileButtonProps) {
  return <MobileButton {...props} variant="secondary" />;
}

export function MobileOutlineButton(props: MobileButtonProps) {
  return <MobileButton {...props} variant="outline" />;
}

export function MobileGhostButton(props: MobileButtonProps) {
  return <MobileButton {...props} variant="ghost" />;
}