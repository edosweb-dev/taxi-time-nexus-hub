
import { useState } from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarNavLinks } from "./sidebar/SidebarNavLinks";
import { SidebarHeader as AppSidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarFooterContent } from "./sidebar/SidebarFooter";
import { BottomNavigation } from "@/components/mobile/BottomNavigation";
import { FeedbackButton } from "@/components/common/FeedbackButton";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";
import { useLayout } from "@/contexts/LayoutContext";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { MobileSidebar } from "@/components/mobile/MobileSidebar";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBottomNav?: boolean;
  headerProps?: {
    showSearch?: boolean;
    onSearch?: () => void;
    showBackButton?: boolean;
    onBackClick?: () => void;
    rightActions?: React.ReactNode;
  };
}

export function MainLayout({ 
  children, 
  title = "TAXITIME",
  showBottomNav = true,
  headerProps = {}
}: MainLayoutProps) {
  const isMobile = useIsMobile();
  const { paddingMode } = useLayout();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Optimized mobile-first responsive padding system
  const getPaddingClasses = (mode: string) => {
    const paddingModes = {
      'default': 'px-4 py-4 sm:px-6 sm:py-4 md:px-6 md:py-6 lg:px-8 lg:py-6 xl:px-8 2xl:px-8',
      'minimal': 'px-2 py-2 sm:px-4 sm:py-2 md:px-6 md:py-4 lg:px-6 xl:px-6 2xl:px-6', 
      'full-width': 'px-2 py-2 sm:px-2 sm:py-2 md:px-4 md:py-3 lg:px-4 xl:px-4 2xl:px-4'
    };
    return paddingModes[mode] || paddingModes['default'];
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="mobile-layout-unified">
        <ImpersonationBanner />
        
        {/* Mobile Header Unificato */}
        <MobileHeader 
          onMenuToggle={() => setSidebarOpen(true)}
          {...headerProps}
        />
        
        {/* Mobile Content */}
        <main className="mobile-content-unified w-full max-w-full overflow-x-hidden">
          <div className={`w-full max-w-full min-h-0 ${getPaddingClasses(paddingMode)} page-enter`}>
            {children}
          </div>
        </main>
        
        {/* Bottom Navigation */}
        {showBottomNav && <BottomNavigation />}
        
        {/* Mobile Sidebar */}
        <MobileSidebar 
          open={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
      </div>
    );
  }
  
  // Desktop Layout
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar 
          className="border-r border-border/50 text-white h-full flex-shrink-0 shadow-xl" 
          collapsible="icon"
          variant="sidebar"
        >
          {/* Enhanced sidebar with gradient background and modern styling */}
          <div className="flex flex-col h-full bg-gradient-to-b from-primary to-primary/90 backdrop-blur-sm relative overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-white/20 to-transparent"></div>
              <div className="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-tl from-white/10 to-transparent"></div>
            </div>
            
            <SidebarHeader className="flex-shrink-0 relative z-10 safe-area-top">
              <AppSidebarHeader />
            </SidebarHeader>
            
            <SidebarContent className="flex-1 overflow-y-auto scroll-smooth relative z-10 py-1">
              <SidebarNavLinks />
            </SidebarContent>
            
            <SidebarFooter className="p-3 flex-shrink-0 relative z-10 safe-area-bottom">
              <SidebarFooterContent />
            </SidebarFooter>
          </div>
        </Sidebar>
        
        <main className="flex-1 bg-background w-full max-w-full overflow-x-hidden">
          <ImpersonationBanner />
          
          <div className={`w-full max-w-full ${getPaddingClasses(paddingMode)} page-enter safe-area-left safe-area-right`}>
            {children}
          </div>
        </main>
        
        {/* Floating Feedback Button */}
        <FeedbackButton />
      </div>
    </SidebarProvider>
  );
}
