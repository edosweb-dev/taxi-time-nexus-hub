import { useIsMobile } from './use-mobile';

export type SpacingType = 'section' | 'component' | 'element' | 'tight';
export type SpacingDirection = 'vertical' | 'horizontal' | 'all';

interface SpacingConfig {
  mobile: string;
  desktop: string;
}

const SPACING_SYSTEM: Record<SpacingType, Record<SpacingDirection, SpacingConfig>> = {
  section: {
    vertical: { mobile: 'space-y-6', desktop: 'md:space-y-8' },
    horizontal: { mobile: 'space-x-4', desktop: 'md:space-x-6' },
    all: { mobile: 'gap-6', desktop: 'md:gap-8' }
  },
  component: {
    vertical: { mobile: 'space-y-4', desktop: 'md:space-y-6' },
    horizontal: { mobile: 'space-x-3', desktop: 'md:space-x-4' },
    all: { mobile: 'gap-4', desktop: 'md:gap-6' }
  },
  element: {
    vertical: { mobile: 'space-y-3', desktop: 'md:space-y-4' },
    horizontal: { mobile: 'space-x-2', desktop: 'md:space-x-3' },
    all: { mobile: 'gap-3', desktop: 'md:gap-4' }
  },
  tight: {
    vertical: { mobile: 'space-y-2', desktop: 'md:space-y-3' },
    horizontal: { mobile: 'space-x-1', desktop: 'md:space-x-2' },
    all: { mobile: 'gap-2', desktop: 'md:gap-3' }
  }
};

export function useResponsiveSpacing(
  type: SpacingType = 'component',
  direction: SpacingDirection = 'vertical'
) {
  const isMobile = useIsMobile();
  const config = SPACING_SYSTEM[type][direction];
  
  // Return combined classes for responsive spacing
  const spacing = `${config.mobile} ${config.desktop}`;
  
  // Also provide individual values for conditional logic
  const mobileSpacing = config.mobile;
  const desktopSpacing = config.desktop;
  
  return {
    spacing,
    mobileSpacing,
    desktopSpacing,
    isMobile
  };
}

// Utility function to get spacing classes directly
export function getResponsiveSpacing(
  type: SpacingType = 'component',
  direction: SpacingDirection = 'vertical'
): string {
  const config = SPACING_SYSTEM[type][direction];
  return `${config.mobile} ${config.desktop}`;
}

// Pre-defined spacing constants for common use cases
export const RESPONSIVE_SPACING = {
  SECTION_VERTICAL: getResponsiveSpacing('section', 'vertical'),
  SECTION_HORIZONTAL: getResponsiveSpacing('section', 'horizontal'),
  COMPONENT_VERTICAL: getResponsiveSpacing('component', 'vertical'),
  COMPONENT_HORIZONTAL: getResponsiveSpacing('component', 'horizontal'),
  ELEMENT_VERTICAL: getResponsiveSpacing('element', 'vertical'),
  ELEMENT_HORIZONTAL: getResponsiveSpacing('element', 'horizontal'),
  TIGHT_VERTICAL: getResponsiveSpacing('tight', 'vertical'),
  TIGHT_HORIZONTAL: getResponsiveSpacing('tight', 'horizontal')
} as const;