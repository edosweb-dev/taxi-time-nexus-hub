
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
      <Sidebar className="border-r border-border">
        <SidebarHeader className="h-16 flex items-center px-4 border-b">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/f9301fdf-4c2b-4c27-938e-04f6b32870f2.png" 
              alt="Taxitime Logo" 
              className="h-8 w-8 object-contain"
            />
            <span className="font-semibold text-lg">TAXITIME</span>
          </div>
          <Button variant="outline" size="icon" className="ml-auto">
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </SidebarHeader>
        
        <SidebarContent className="p-2">
          {/* Sidebar content will go here in future iterations */}
        </SidebarContent>
        
        <SidebarFooter className="p-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-taxitime-100 flex items-center justify-center text-taxitime-700">
              <User size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {profile?.first_name && profile?.last_name 
                  ? `${profile.first_name} ${profile.last_name}`
                  : profile?.first_name || 'Utente'}
              </span>
              <span className="text-xs text-muted-foreground capitalize">{profile?.role || ''}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-auto text-muted-foreground hover:text-destructive"
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
