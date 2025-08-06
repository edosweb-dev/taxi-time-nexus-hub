
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/components/ui/sidebar";
import { User, LogOut } from "lucide-react";

export function SidebarFooterContent() {
  const { profile, signOut } = useAuth();
  const { state } = useSidebar();
  
  if (state === "collapsed") {
    return (
      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white shadow-lg">
            <User size={18} />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 border-2 border-primary rounded-full"></div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white/70 hover:text-white hover:bg-white/20 w-10 h-10 rounded-xl transition-all duration-200 hover:scale-105"
          onClick={() => signOut()}
          title="Esci"
        >
          <LogOut size={16} />
        </Button>
      </div>
    );
  }
  
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white shadow-lg">
            <User size={20} />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 border-2 border-primary rounded-full animate-pulse"></div>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-sm font-semibold text-white truncate">
            {profile?.first_name && profile?.last_name 
              ? `${profile.first_name} ${profile.last_name}`
              : profile?.first_name || 'Utente'}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/70 capitalize font-medium">{profile?.role || ''}</span>
            <div className="w-1 h-1 bg-white/40 rounded-full"></div>
            <span className="text-xs text-white/60">Online</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-white/40 rounded-full"></div>
          <span className="text-xs text-white/60 font-medium">Dashboard Attivo</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white/70 hover:text-white hover:bg-white/20 w-8 h-8 rounded-lg transition-all duration-200 hover:scale-110"
          onClick={() => signOut()}
          title="Esci"
        >
          <LogOut size={14} />
        </Button>
      </div>
    </div>
  );
}
