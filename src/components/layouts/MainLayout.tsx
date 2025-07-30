
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

  const getPaddingClasses = (mode: string) => {
    const basePadding = isMobile ? 'px-3' : 'px-4';
    const paddingModes = {
      'default': isMobile 
        ? 'px-3 sm:px-4' 
        : 'px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20',
      'minimal': isMobile 
        ? 'px-2 sm:px-3' 
        : 'px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12', 
      'full-width': isMobile 
        ? 'px-1 sm:px-2' 
        : 'px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 2xl:px-10'
    };
    return paddingModes[mode] || paddingModes['default'];
  };
  
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar 
          className="border-r border-border text-white h-full flex-shrink-0" 
          collapsible={isMobile ? "offcanvas" : "icon"}
          variant={isMobile ? "sidebar" : "sidebar"}
        >
          {/* This container will hold the actual sidebar content with primary background */}
          <div className="flex flex-col h-full bg-primary">
            <SidebarHeader className="h-14 flex items-center px-4 flex-shrink-0">
              <AppSidebarHeader />
            </SidebarHeader>
            
            <SidebarContent className="p-2 flex-1 overflow-y-auto">
              <SidebarNavLinks />
            </SidebarContent>
            
            <SidebarFooter className="p-4 border-t border-white/20 flex-shrink-0">
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
            <div className={`w-full ${getPaddingClasses(paddingMode)} ${isMobile ? 'py-4' : 'py-8'} page-enter`}>
              {children}
            </div>
          </div>
          
          {/* Mobile bottom padding to avoid navigation overlap */}
          {isMobile && <div className="h-20 flex-shrink-0" />}
        </main>
        
        {isMobile && <MobileNavBar />}
        
        {/* Floating Feedback Button - hidden on mobile to avoid UX interference */}
        {!isMobile && <FeedbackButton />}
      </div>
    </SidebarProvider>
  );
}
