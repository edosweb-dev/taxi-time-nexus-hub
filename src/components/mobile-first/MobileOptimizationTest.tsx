import React from 'react';
import { useResponsive } from '@/hooks/use-responsive';
import { MobileOptimizedContainer, MobileCard, MobileGrid } from '@/components/ui/mobile-optimized-container';
import { MobileButton, MobilePrimaryButton, MobileSecondaryButton } from '@/components/ui/mobile-button';
import { MobileInput, MobileTextarea } from '@/components/ui/mobile-input';
import { mobileClasses } from '@/utils/mobile-classes';
import { cn } from '@/lib/utils';

export function MobileOptimizationTest() {
  const { isMobile, isTablet, isDesktop, screenWidth, orientation } = useResponsive();

  const deviceInfo = [
    { label: 'Screen Width', value: `${screenWidth}px` },
    { label: 'Device Type', value: isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop' },
    { label: 'Orientation', value: orientation },
  ];

  return (
    <MobileOptimizedContainer className="py-fluid-xl">
      <div className={mobileClasses.text.heading}>
        🔧 Mobile Optimization Test
      </div>
      
      <div className={cn(mobileClasses.text.caption, 'mt-fluid-sm mb-fluid-lg')}>
        Test della responsività e ottimizzazione mobile
      </div>

      {/* Device Info Grid */}
      <MobileGrid cols={3} className="mb-fluid-xl">
        {deviceInfo.map((info, index) => (
          <MobileCard key={index} padding="sm">
            <div className={mobileClasses.text.label}>{info.label}</div>
            <div className={mobileClasses.text.body}>{info.value}</div>
          </MobileCard>
        ))}
      </MobileGrid>

      {/* Touch Target Test */}
      <MobileCard className="mb-fluid-lg">
        <div className={cn(mobileClasses.text.subheading, 'mb-fluid-md')}>
          Touch Targets Test
        </div>
        <div className={mobileClasses.stack.horizontal}>
          <MobilePrimaryButton>Primary</MobilePrimaryButton>
          <MobileSecondaryButton>Secondary</MobileSecondaryButton>
          <MobileButton variant="outline">Outline</MobileButton>
        </div>
      </MobileCard>

      {/* Form Elements Test */}
      <MobileCard className="mb-fluid-lg">
        <div className={cn(mobileClasses.text.subheading, 'mb-fluid-md')}>
          Form Elements Test
        </div>
        <div className={mobileClasses.spacing.form}>
          <MobileInput 
            placeholder="Mobile optimized input"
            fluid
          />
          <MobileTextarea 
            placeholder="Mobile optimized textarea"
            rows={3}
          />
        </div>
      </MobileCard>

      {/* Typography Scale Test */}
      <MobileCard className="mb-fluid-lg">
        <div className={cn(mobileClasses.text.subheading, 'mb-fluid-md')}>
          Typography Scale Test
        </div>
        <div className={mobileClasses.spacing.form}>
          <div className="text-fluid-heading-xl">Heading XL (Fluid)</div>
          <div className="text-fluid-heading-lg">Heading LG (Fluid)</div>
          <div className="text-fluid-heading-md">Heading MD (Fluid)</div>
          <div className="text-fluid-heading-sm">Heading SM (Fluid)</div>
          <div className="text-fluid-text-lg">Text LG (Fluid)</div>
          <div className="text-fluid-text-base">Text Base (Fluid)</div>
          <div className="text-fluid-text-sm">Text SM (Fluid)</div>
          <div className="text-fluid-text-xs">Text XS (Fluid)</div>
        </div>
      </MobileCard>

      {/* Spacing Test */}
      <MobileCard className="mb-fluid-lg">
        <div className={cn(mobileClasses.text.subheading, 'mb-fluid-md')}>
          Fluid Spacing Test
        </div>
        <div className="space-y-fluid-sm">
          <div className="bg-primary/10 p-fluid-xs rounded">XS Padding</div>
          <div className="bg-primary/20 p-fluid-sm rounded">SM Padding</div>
          <div className="bg-primary/30 p-fluid-md rounded">MD Padding</div>
          <div className="bg-primary/40 p-fluid-lg rounded">LG Padding</div>
          <div className="bg-primary/50 p-fluid-xl rounded">XL Padding</div>
        </div>
      </MobileCard>

      {/* Safe Area Test */}
      <MobileCard>
        <div className={cn(mobileClasses.text.subheading, 'mb-fluid-md')}>
          Safe Area Test
        </div>
        <div className={cn(
          'bg-accent/20 rounded p-4',
          mobileClasses.safeArea.all
        )}>
          <div className={mobileClasses.text.body}>
            This content respects safe area insets (notches, etc.)
          </div>
        </div>
      </MobileCard>

      {/* Responsive Visibility Test */}
      <div className="mt-fluid-lg">
        <div className="block md:hidden bg-green-100 dark:bg-green-900/20 p-fluid-sm rounded mb-fluid-sm">
          ✅ Mobile: This is visible only on mobile
        </div>
        <div className="hidden md:block bg-blue-100 dark:bg-blue-900/20 p-fluid-sm rounded">
          💻 Desktop: This is visible only on desktop
        </div>
      </div>
    </MobileOptimizedContainer>
  );
}