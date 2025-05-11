
import { PropsWithChildren } from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarNavLinks } from "./sidebar/SidebarNavLinks";
import { SidebarHeader as AppSidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarFooterContent } from "./sidebar/SidebarFooter";
import { MobileNavBar } from "./mobile/MobileNavBar";

export function MainLayout({ children }: PropsWithChildren) {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar className="border-r border-border text-white">
        {/* This container will hold the actual sidebar content with black background */}
        <div className="flex flex-col h-full bg-black">
          <SidebarHeader className="h-14 flex items-center border-b border-white/20">
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
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </div>
      </main>
      
      {isMobile && <MobileNavBar />}
    </div>
  );
}
