
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/components/ui/sidebar";
import { User, LogOut } from "lucide-react";

export function SidebarFooterContent() {
  const { profile, signOut } = useAuth();
  const { state } = useSidebar();
  
  const isCollapsed = state === "collapsed";
  
  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary">
          <User size={20} />
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white/70 hover:text-white hover:bg-white/20 w-10 h-10"
          onClick={() => signOut()}
          title="Esci"
        >
          <LogOut size={18} />
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary">
        <User size={18} />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-sm font-medium truncate">
          {profile?.first_name && profile?.last_name 
            ? `${profile.first_name} ${profile.last_name}`
            : profile?.first_name || 'Utente'}
        </span>
        <span className="text-xs text-white/70 capitalize">{profile?.role || ''}</span>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-white/70 hover:text-white hover:bg-white/20 flex-shrink-0"
        onClick={() => signOut()}
        title="Esci"
      >
        <LogOut size={16} />
      </Button>
    </div>
  );
}
