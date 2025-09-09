import React, { useState } from 'react';
import { MobileHeader } from './MobileHeader';
import { BottomNavigation } from './BottomNavigation';
import { MobileSidebar } from './MobileSidebar';

interface MobileLayoutProps {
  children: React.ReactNode;
  title: string; // Keep for page content, not header
  showBottomNav?: boolean;
  showHeader?: boolean;
}

export function MobileLayout({ 
  children, 
  title, 
  showBottomNav = true,
  showHeader = true 
}: MobileLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="mobile-container">
      {showHeader && (
        <MobileHeader 
          onMenuToggle={() => setSidebarOpen(true)} 
        />
      )}
      
      <div className="mobile-content">
        {/* Enhanced page title section */}
        <div className="
          bg-gradient-to-r from-background via-muted/30 to-background
          px-6 py-5 
          border-b border-border/30
          shadow-sm
          relative overflow-hidden
        ">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-accent/10 rounded-full translate-y-8 -translate-x-8"></div>
          
          <div className="relative z-10">
            <h1 className="
              text-2xl font-bold text-foreground 
              tracking-tight leading-tight
              mb-1
            ">
              {title}
            </h1>
            <div className="
              h-1 w-12 bg-gradient-to-r from-primary to-primary/50 
              rounded-full
            "></div>
          </div>
        </div>
        {children}
      </div>

      {showBottomNav && <BottomNavigation />}
      
      <MobileSidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
    </div>
  );
}