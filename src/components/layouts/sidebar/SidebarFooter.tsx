
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/components/ui/sidebar";
import { User, LogOut } from "lucide-react";

export function SidebarFooterContent() {
  const { profile, signOut } = useAuth();
  const { state } = useSidebar();
  
  if (state === "collapsed") {
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="relative">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white shadow-md">
            <User size={16} />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 border border-primary rounded-full"></div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white/70 hover:text-white hover:bg-white/20 w-8 h-8 rounded-lg transition-all duration-200"
          onClick={() => signOut()}
          title="Esci"
        >
          <LogOut size={14} />
        </Button>
      </div>
    );
  }
  
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 shadow-lg">
      <div className="flex items-center gap-3 mb-2">
        <div className="relative">
          <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white shadow-md">
            <User size={18} />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 border border-primary rounded-full"></div>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-sm font-semibold text-white truncate">
            {profile?.first_name && profile?.last_name 
              ? `${profile.first_name} ${profile.last_name}`
              : profile?.first_name || 'Utente'}
          </span>
          <span className="text-xs text-white/60 capitalize font-medium">{profile?.role || ''}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50 font-medium">Online</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white/70 hover:text-white hover:bg-white/20 w-7 h-7 rounded-lg transition-all duration-200"
          onClick={() => signOut()}
          title="Esci"
        >
          <LogOut size={12} />
        </Button>
      </div>
    </div>
  );
}
