import { useIsMobile } from './use-mobile';

export type ResponsiveStyleVariant = {
  headingClass: string;
  textClass: string;
  inputClass: string;
  buttonClass: string;
  sectionSpacing: string;
  containerClass: string;
};

export type StyleSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4';

interface UseResponsiveStylesOptions {
  headingLevel?: HeadingLevel;
  textSize?: StyleSize;
  spacing?: StyleSize;
  container?: StyleSize;
}

export function useResponsiveStyles(options: UseResponsiveStylesOptions = {}): ResponsiveStyleVariant {
  const isMobile = useIsMobile();
  const {
    headingLevel = 'h2',
    textSize = 'md',
    spacing = 'lg',
    container = 'lg'
  } = options;

  // Fluid typography classes
  const headingClasses = {
    h1: 'fluid-heading-xl font-bold tracking-tight text-foreground',
    h2: 'fluid-heading-lg font-semibold tracking-tight text-foreground',
    h3: 'fluid-heading-md font-semibold text-foreground',
    h4: 'fluid-heading-sm font-medium text-foreground'
  };

  const textClasses = {
    xs: 'fluid-text-xs text-muted-foreground leading-normal',
    sm: 'fluid-text-sm text-muted-foreground leading-relaxed',
    md: 'fluid-text-base text-foreground leading-relaxed',
    lg: 'fluid-text-lg text-foreground leading-relaxed',
    xl: 'fluid-text-lg font-medium text-foreground leading-relaxed'
  };

  // Form input classes with fluid sizing
  const inputClass = `
    w-full bg-background border border-input rounded-md
    transition-colors duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
    placeholder:text-muted-foreground
    disabled:cursor-not-allowed disabled:opacity-50
    fluid-text-base
  `.trim().replace(/\s+/g, ' ');

  // Button classes with fluid sizing
  const buttonClass = `
    inline-flex items-center justify-center whitespace-nowrap rounded-md
    transition-colors duration-200 ease-in-out
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
    disabled:pointer-events-none disabled:opacity-50
    fluid-text-base font-medium
    bg-primary text-primary-foreground hover:bg-primary/90
  `.trim().replace(/\s+/g, ' ');

  // Section spacing classes
  const spacingClasses = {
    xs: 'fluid-space-xs',
    sm: 'fluid-space-sm', 
    md: 'fluid-space-md',
    lg: 'fluid-space-lg',
    xl: 'fluid-space-xl'
  };

  // Container classes with fluid widths
  const containerClasses = {
    xs: 'w-full max-w-sm mx-auto',
    sm: 'w-full max-w-md mx-auto',
    md: 'w-full max-w-2xl mx-auto',
    lg: 'w-full max-w-4xl mx-auto',
    xl: 'w-full max-w-6xl mx-auto'
  };

  // Mobile-specific adjustments
  const mobileAdjustments = isMobile ? {
    padding: 'px-4 py-3',
    spacing: 'space-y-3',
    gap: 'gap-3'
  } : {
    padding: 'px-6 py-4',
    spacing: 'space-y-4',
    gap: 'gap-4'
  };

  return {
    headingClass: headingClasses[headingLevel],
    textClass: textClasses[textSize],
    inputClass: `${inputClass} ${mobileAdjustments.padding}`,
    buttonClass: `${buttonClass} ${mobileAdjustments.padding}`,
    sectionSpacing: `${spacingClasses[spacing]} ${mobileAdjustments.spacing}`,
    containerClass: `${containerClasses[container]} ${mobileAdjustments.padding}`
  };
}

// Utility function to get specific style categories
export function getFluidTypography(level: HeadingLevel = 'h2') {
  return useResponsiveStyles({ headingLevel: level }).headingClass;
}

export function getFluidText(size: StyleSize = 'md') {
  return useResponsiveStyles({ textSize: size }).textClass;
}

export function getFluidSpacing(size: StyleSize = 'lg') {
  return useResponsiveStyles({ spacing: size }).sectionSpacing;
}

export function getFluidContainer(size: StyleSize = 'lg') {
  return useResponsiveStyles({ container: size }).containerClass;
}

// Pre-defined style combinations for common use cases
export const FLUID_STYLES = {
  PAGE_TITLE: 'fluid-heading-xl font-bold tracking-tight text-foreground',
  SECTION_TITLE: 'fluid-heading-lg font-semibold tracking-tight text-foreground',
  CARD_TITLE: 'fluid-heading-md font-semibold text-foreground',
  BODY_TEXT: 'fluid-text-base text-foreground leading-relaxed',
  CAPTION_TEXT: 'fluid-text-sm text-muted-foreground leading-relaxed',
  SECTION_SPACING: 'fluid-space-lg',
  COMPONENT_SPACING: 'fluid-space-md',
  ELEMENT_SPACING: 'fluid-space-sm'
} as const;