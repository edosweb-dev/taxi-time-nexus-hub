import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  preventZoom?: boolean;
  fluid?: boolean;
}

interface MobileTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  preventZoom?: boolean;
  fluid?: boolean;
}

export function MobileInput({ 
  className = '',
  preventZoom = true,
  fluid = false,
  ...props 
}: MobileInputProps) {
  return (
    <Input
      {...props}
      className={cn(
        // Prevent zoom on iOS by ensuring minimum 16px font size
        preventZoom && 'text-base',
        // Touch-optimized height
        'min-h-[var(--fluid-input-height)]',
        // Fluid width on mobile
        fluid && 'w-full',
        // Responsive horizontal padding - FIX PRINCIPALE
        'px-3 md:px-5 lg:px-6',
        // Vertical padding
        'py-[var(--fluid-input-padding-y)]',
        // Enhanced mobile styling
        'text-fluid-text-base',
        className
      )}
    />
  );
}

export function MobileTextarea({ 
  className = '',
  preventZoom = true,
  fluid = true,
  rows = 4,
  ...props 
}: MobileTextareaProps) {
  return (
    <Textarea
      {...props}
      rows={rows}
      className={cn(
        // Prevent zoom on iOS
        preventZoom && 'text-base',
        // Fluid width
        fluid && 'w-full',
        // Responsive horizontal padding - FIX PRINCIPALE
        'px-3 md:px-5 lg:px-6',
        // Vertical padding
        'py-[var(--fluid-input-padding-y)]',
        // Enhanced mobile styling
        'text-fluid-text-base',
        // Better line height for mobile
        'leading-relaxed',
        className
      )}
    />
  );
}

// Specialized search input for mobile
export function MobileSearchInput({ 
  placeholder = "Cerca...",
  className = '',
  ...props 
}: MobileInputProps) {
  return (
    <MobileInput
      {...props}
      type="search"
      placeholder={placeholder}
      className={cn(
        'pl-10 pr-3 md:pr-5 lg:pr-6', // Space for search icon + responsive padding
        className
      )}
    />
  );
}