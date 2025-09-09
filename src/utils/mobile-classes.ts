// Mobile-first responsive utility classes
export const mobileClasses = {
  // Layout utilities
  container: {
    fluid: 'w-full overflow-x-hidden',
    centered: 'max-w-7xl mx-auto px-fluid-md sm:px-fluid-lg lg:px-fluid-xl',
    fullscreen: 'min-h-dvh w-full',
  },

  // Typography utilities
  text: {
    heading: 'text-fluid-heading-lg font-bold leading-tight',
    subheading: 'text-fluid-heading-sm font-semibold leading-snug',
    body: 'text-fluid-text-base leading-relaxed',
    caption: 'text-fluid-text-sm text-muted-foreground',
    label: 'text-fluid-text-sm font-medium',
  },

  // Spacing utilities
  spacing: {
    section: 'py-fluid-xl',
    card: 'p-fluid-md sm:p-fluid-lg',
    form: 'space-y-fluid-md',
    grid: 'gap-fluid-md',
  },

  // Touch-optimized interactions
  touch: {
    target: 'min-h-touch min-w-touch',
    button: 'min-h-touch px-fluid-lg py-fluid-sm active:scale-95 transition-transform no-select',
    input: 'min-h-[var(--fluid-input-height)] px-[var(--fluid-input-padding-x)] py-[var(--fluid-input-padding-y)]',
  },

  // Layout patterns
  stack: {
    vertical: 'flex flex-col gap-fluid-md',
    horizontal: 'flex flex-row items-center gap-fluid-sm flex-wrap',
    centered: 'flex items-center justify-center',
  },

  // Grid patterns
  grid: {
    responsive1: 'grid grid-cols-1 gap-fluid-md',
    responsive2: 'grid grid-cols-1 xs:grid-cols-2 gap-fluid-sm xs:gap-fluid-md',
    responsive3: 'grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-fluid-sm sm:gap-fluid-md',
    responsive4: 'grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-fluid-sm lg:gap-fluid-md',
  },

  // Safe area utilities
  safeArea: {
    all: 'safe-area-top safe-area-bottom safe-area-left safe-area-right',
    vertical: 'safe-area-top safe-area-bottom',
    horizontal: 'safe-area-left safe-area-right',
    top: 'safe-area-top',
    bottom: 'safe-area-bottom',
  },

  // Animation utilities
  animations: {
    fadeIn: 'animate-fade-in',
    scaleIn: 'animate-scale-in',
    slideIn: 'animate-slide-in-right',
    smooth: 'transition-all duration-200 ease-out',
  },

  // Navigation utilities
  nav: {
    mobile: 'mobile-nav-item',
    sticky: 'sticky top-0 z-30 bg-background/95 backdrop-blur-md',
    bottom: 'fixed bottom-0 left-0 right-0 z-50',
  },
};

// Helper function to combine mobile classes
export function combineMobileClasses(...classArrays: (string | undefined)[]): string {
  return classArrays.filter(Boolean).join(' ');
}

// Responsive breakpoint utilities
export const breakpoints = {
  xs: '(min-width: 375px)',
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
};

// Common responsive patterns
export const responsivePatterns = {
  showOnMobile: 'block md:hidden',
  hideOnMobile: 'hidden md:block',
  showOnDesktop: 'hidden md:block',
  hideOnDesktop: 'block md:hidden',
  fullWidthMobile: 'w-full md:w-auto',
  centerOnMobile: 'mx-auto md:mx-0',
  stackOnMobile: 'flex-col md:flex-row',
};