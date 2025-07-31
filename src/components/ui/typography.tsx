import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export interface TypographyProps {
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'small';
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

const Typography: React.FC<TypographyProps> = ({ 
  variant, 
  children, 
  className,
  as
}) => {
  const isMobile = useIsMobile();
  
  // Map variants to semantic HTML elements and CSS classes
  const variantConfig = {
    h1: {
      element: 'h1',
      classes: 'text-h1 font-bold text-foreground leading-tight tracking-tight'
    },
    h2: {
      element: 'h2', 
      classes: 'text-h2 font-semibold text-foreground leading-tight tracking-tight'
    },
    h3: {
      element: 'h3',
      classes: 'text-h3 font-semibold text-foreground leading-snug'
    },
    h4: {
      element: 'h4',
      classes: 'text-h4 font-medium text-foreground leading-snug'
    },
    body: {
      element: 'p',
      classes: 'text-body text-foreground leading-relaxed'
    },
    caption: {
      element: 'p',
      classes: 'text-caption text-muted-foreground leading-normal'
    },
    small: {
      element: 'span',
      classes: 'text-small text-muted-foreground leading-normal'
    }
  } as const;

  const config = variantConfig[variant];
  const Element = (as || config.element) as keyof JSX.IntrinsicElements;
  
  // Mobile-specific optimizations
  const mobileOptimizations = isMobile ? {
    h1: 'max-w-[280px] sm:max-w-none',
    h2: 'max-w-[300px] sm:max-w-none', 
    h3: 'max-w-[320px] sm:max-w-none',
    h4: 'max-w-[340px] sm:max-w-none',
    body: '',
    caption: '',
    small: ''
  }[variant] : '';

  return (
    <Element 
      className={cn(
        config.classes,
        mobileOptimizations,
        className
      )}
    >
      {children}
    </Element>
  );
};

export { Typography };