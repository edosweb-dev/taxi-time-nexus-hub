
import { PropsWithChildren } from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Home, LogOut, Menu, User, CalendarDays, LayoutDashboard } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function MainLayout({ children }: PropsWithChildren) {
  const { profile, signOut } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar className="border-r border-border bg-black text-white">
        <SidebarHeader className="h-14 flex items-center px-4 border-b border-white/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#6a8298] font-bold text-lg">
              T
            </div>
            <span className="font-semibold text-lg tracking-wide">TAXITIME V2</span>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto text-white hover:bg-white/20 hover:text-white">
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </SidebarHeader>
        
        <SidebarContent className="p-2">
          <div className="space-y-1">
            <Link 
              to="/dashboard" 
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/20",
                location.pathname === "/dashboard" ? "bg-white/30" : "transparent"
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link 
              to="/shifts" 
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/20",
                location.pathname === "/shifts" ? "bg-white/30" : "transparent"
              )}
            >
              <CalendarDays className="h-4 w-4" />
              <span>Turni</span>
            </Link>
          </div>
        </SidebarContent>
        
        <SidebarFooter className="p-4 border-t border-white/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#6a8298]">
              <User size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {profile?.first_name && profile?.last_name 
                  ? `${profile.first_name} ${profile.last_name}`
                  : profile?.first_name || 'Utente'}
              </span>
              <span className="text-xs text-white/70 capitalize">{profile?.role || ''}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-auto text-white/70 hover:text-white hover:bg-white/20"
              onClick={() => signOut()}
            >
              <LogOut size={16} />
              <span className="sr-only">Esci</span>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      
      <main className="flex-1 flex flex-col overflow-hidden bg-background">
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </div>
      </main>
      
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/20 flex items-center justify-around py-2 px-4 z-50 text-white">
          <Link 
            to="/dashboard" 
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-md",
              location.pathname === "/dashboard" ? "text-white" : "text-white/70"
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
          <Link 
            to="/shifts" 
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-md",
              location.pathname === "/shifts" ? "text-white" : "text-white/70"
            )}
          >
            <CalendarDays className="h-5 w-5" />
            <span className="text-xs mt-1">Turni</span>
          </Link>
          <button 
            onClick={() => signOut()}
            className="flex flex-col items-center justify-center p-2 rounded-md text-white/70 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-xs mt-1">Esci</span>
          </button>
        </div>
      )}
    </div>
  );
}
