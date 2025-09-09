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
        {/* Page title inside content */}
        <div className="p-4 border-b border-border/20">
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
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