
import { PropsWithChildren } from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Menu, User } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export function MainLayout({ children }: PropsWithChildren) {
  const { profile, signOut } = useAuth();
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar className="border-r border-border bg-sidebar-taxitime text-white">
        <SidebarHeader className="h-20 flex items-center px-4 border-b border-taxitime-400/30">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg p-1 shadow-md">
              <img 
                src="/lovable-uploads/f9301fdf-4c2b-4c27-938e-04f6b32870f2.png" 
                alt="Taxitime Logo" 
                className="h-9 w-9 object-contain"
              />
            </div>
            <span className="font-bold text-xl tracking-wide text-white">TAXITIME</span>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto text-white hover:bg-taxitime-400/20">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </SidebarHeader>
        
        <SidebarContent className="p-2">
          {/* Sidebar content will go here in future iterations */}
        </SidebarContent>
        
        <SidebarFooter className="p-4 border-t border-taxitime-400/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">
              <User size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">
                {profile?.first_name && profile?.last_name 
                  ? `${profile.first_name} ${profile.last_name}`
                  : profile?.first_name || 'Utente'}
              </span>
              <span className="text-xs text-white/70 capitalize">{profile?.role || ''}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-auto text-white/70 hover:text-white hover:bg-taxitime-400/20"
              onClick={() => signOut()}
            >
              <LogOut size={16} />
              <span className="sr-only">Esci</span>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
