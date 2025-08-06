
import { PropsWithChildren } from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarNavLinks } from "./sidebar/SidebarNavLinks";
import { SidebarHeader as AppSidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarFooterContent } from "./sidebar/SidebarFooter";
import { MobileNavBar } from "./mobile/MobileNavBar";
import { FeedbackButton } from "@/components/common/FeedbackButton";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";
import { useLayout } from "@/contexts/LayoutContext";

export function MainLayout({ children }: PropsWithChildren) {
  const isMobile = useIsMobile();
  const { paddingMode } = useLayout();

  // Mobile-first responsive padding system optimized for mobile viewports
  const getPaddingClasses = (mode: string) => {
    const paddingModes = {
      'default': 'px-5 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6 lg:px-8 xl:px-12 2xl:px-16',
      'minimal': 'px-5 py-2 sm:px-2 sm:py-2 md:px-4 md:py-4 lg:px-6 xl:px-8 2xl:px-10', 
      'full-width': 'px-5 py-1 sm:px-1 sm:py-2 md:px-2 md:py-3 lg:px-4 xl:px-6 2xl:px-8'
    };
    return paddingModes[mode] || paddingModes['default'];
  };
  
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar 
          className="border-r border-border/50 text-white h-full flex-shrink-0 shadow-xl" 
          collapsible={isMobile ? "offcanvas" : "icon"}
          variant="sidebar"
        >
          {/* Enhanced sidebar with gradient background and modern styling */}
          <div className="flex flex-col h-full bg-gradient-to-b from-primary to-primary/90 backdrop-blur-sm relative overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-white/20 to-transparent"></div>
              <div className="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-tl from-white/10 to-transparent"></div>
            </div>
            
            <SidebarHeader className="flex-shrink-0 relative z-10">
              <AppSidebarHeader />
            </SidebarHeader>
            
            <SidebarContent className="flex-1 overflow-y-auto relative z-10 py-1">
              <SidebarNavLinks />
            </SidebarContent>
            
            <SidebarFooter className="p-3 flex-shrink-0 relative z-10">
              <SidebarFooterContent />
            </SidebarFooter>
          </div>
        </Sidebar>
        
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">
          <ImpersonationBanner />
          {/* Mobile header with sidebar trigger */}
          {isMobile && (
            <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4 flex-shrink-0">
              <SidebarTrigger className="hover:bg-accent hover:text-accent-foreground p-2 rounded-md transition-colors" />
              <div className="text-sm font-medium text-foreground">TAXITIME</div>
            </header>
          )}
          
          <div className="flex-1 overflow-y-auto">
            <div className={`w-full min-h-0 ${getPaddingClasses(paddingMode)} page-enter`}>
              {children}
            </div>
          </div>
          
          {/* Mobile bottom padding to avoid navigation overlap */}
          {isMobile && <div className="h-24 flex-shrink-0" />}
        </main>
        
        {isMobile && <MobileNavBar />}
        
        {/* Floating Feedback Button - hidden on mobile to avoid UX interference */}
        {!isMobile && <FeedbackButton />}
      </div>
    </SidebarProvider>
  );
}
