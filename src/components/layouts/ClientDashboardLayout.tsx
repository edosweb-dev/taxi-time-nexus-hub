
import { PropsWithChildren } from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarNavLinks } from "./sidebar/SidebarNavLinks";
import { SidebarHeader as AppSidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarFooterContent } from "./sidebar/SidebarFooter";
import { MobileNavBar } from "./mobile/MobileNavBar";
import { FeedbackButton } from "@/components/common/FeedbackButton";

export function ClientDashboardLayout({ children }: PropsWithChildren) {
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar 
          className="border-r border-border text-white" 
          collapsible={isMobile ? "offcanvas" : "icon"}
        >
          <div className="flex flex-col h-full bg-primary">
            <SidebarHeader className="h-14 flex items-center px-4">
              <AppSidebarHeader />
            </SidebarHeader>
            
            <SidebarContent className="p-2">
              <SidebarNavLinks />
            </SidebarContent>
            
            <SidebarFooter className="p-4 border-t border-white/20">
              <SidebarFooterContent />
            </SidebarFooter>
          </div>
        </Sidebar>
        
        <main className="flex-1 flex flex-col overflow-hidden bg-background">
          {/* Mobile header */}
          {isMobile && (
            <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4 flex-shrink-0">
              <div className="text-sm font-medium text-foreground">TAXITIME</div>
            </header>
          )}
          
          <div className="flex-1 overflow-auto">
            <div className={`${isMobile ? 'p-3' : 'p-4 md:p-6'}`}>
              {children}
            </div>
          </div>
          
          {/* Mobile bottom padding */}
          {isMobile && <div className="h-20 flex-shrink-0" />}
        </main>
        
        {isMobile && <MobileNavBar />}
        
        {/* Floating Feedback Button - hidden on mobile to avoid UX interference */}
        {!isMobile && <FeedbackButton />}
      </div>
    </SidebarProvider>
  );
}
