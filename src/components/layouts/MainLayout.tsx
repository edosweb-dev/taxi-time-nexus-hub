
import { PropsWithChildren } from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarNavLinks } from "./sidebar/SidebarNavLinks";
import { SidebarHeader as AppSidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarFooterContent } from "./sidebar/SidebarFooter";
import { MobileNavBar } from "./mobile/MobileNavBar";
import { FeedbackButton } from "@/components/common/FeedbackButton";

export function MainLayout({ children }: PropsWithChildren) {
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r border-border text-white">
          {/* This container will hold the actual sidebar content with primary background */}
          <div className="flex flex-col h-full bg-primary">
            <SidebarHeader className="h-14 flex items-center">
              <div className="flex items-center justify-between w-full px-2">
                <AppSidebarHeader />
                <SidebarTrigger className="text-white hover:bg-white/10" />
              </div>
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
          <div className="flex-1 overflow-auto">
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
