import React, { useState } from 'react';
import { MobileHeader } from './MobileHeader';
import { BottomNavigation } from './BottomNavigation';
import { MobileSidebar } from './MobileSidebar';

interface MobileLayoutProps {
  children: React.ReactNode;
  title: string;
  showBottomNav?: boolean;
}

export function MobileLayout({ 
  children, 
  title, 
  showBottomNav = true 
}: MobileLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="mobile-container">
      <MobileHeader 
        title={title} 
        onMenuToggle={() => setSidebarOpen(true)} 
      />
      
      <div className="mobile-content">
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