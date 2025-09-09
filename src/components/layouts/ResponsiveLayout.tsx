import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  mobileLayout?: React.ComponentType<{ children: React.ReactNode }>;
  desktopLayout?: React.ComponentType<{ children: React.ReactNode }>;
  className?: string;
}

export function ResponsiveLayout({ 
  children, 
  mobileLayout: MobileLayout,
  desktopLayout: DesktopLayout,
  className 
}: ResponsiveLayoutProps) {
  const isMobile = useIsMobile();
  
  // If no specific layouts provided, render children directly with responsive container
  if (!MobileLayout && !DesktopLayout) {
    return (
      <div className={`w-full min-h-screen ${className || ''}`}>
        {children}
      </div>
    );
  }
  
  // Conditional rendering based on device type
  if (isMobile && MobileLayout) {
    return (
      <MobileLayout>
        {children}
      </MobileLayout>
    );
  }
  
  if (!isMobile && DesktopLayout) {
    return (
      <DesktopLayout>
        {children}
      </DesktopLayout>
    );
  }
  
  // Fallback to direct rendering
  return (
    <div className={`w-full min-h-screen ${className || ''}`}>
      {children}
    </div>
  );
}