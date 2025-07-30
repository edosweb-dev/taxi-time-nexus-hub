
import { PropsWithChildren } from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarNavLinks } from "./sidebar/SidebarNavLinks";
import { SidebarHeader as AppSidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarFooterContent } from "./sidebar/SidebarFooter";
import { MobileNavBar } from "./mobile/MobileNavBar";
import { FeedbackButton } from "@/components/common/FeedbackButton";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";

export function MainLayout({ children }: PropsWithChildren) {
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar className="border-r border-border text-white h-full flex-shrink-0" collapsible="none">
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
          {/* Header bar without sidebar trigger on desktop */}
          {isMobile && (
            <div className="h-12 border-b border-border bg-card flex items-center px-4 flex-shrink-0">
              <SidebarTrigger className="hover:bg-accent hover:text-accent-foreground p-2 rounded-md" />
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto">
            <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 page-enter">
              {children}
            </div>
          </div>
        </main>
        
        {isMobile && <MobileNavBar />}
        
        {/* Floating Feedback Button - hidden on mobile to avoid UX interference */}
        {!isMobile && <FeedbackButton />}
      </div>
    </SidebarProvider>
  );
}
