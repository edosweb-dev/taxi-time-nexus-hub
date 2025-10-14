
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/components/ui/sidebar";
import { User, LogOut } from "lucide-react";

export function SidebarFooterContent() {
  const { profile, signOut } = useAuth();
  const { state } = useSidebar();
  
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500/90';
      case 'socio': return 'bg-blue-500/90';
      case 'dipendente': return 'bg-green-500/90';
      case 'cliente': return 'bg-purple-500/90';
      default: return 'bg-gray-500/90';
    }
  };
  
  if (state === "collapsed") {
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm border-2 border-white shadow-lg flex items-center justify-center">
            <span className="text-primary font-bold text-lg">
              {profile?.first_name?.[0] || 'U'}
            </span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-primary rounded-full shadow-md"></div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white/80 hover:text-white hover:bg-white/20 w-8 h-8 rounded-lg transition-all duration-200"
          onClick={() => signOut()}
          title="Esci"
        >
          <LogOut size={16} />
        </Button>
      </div>
    );
  }
  
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/30 shadow-xl">
      <div className="flex items-center gap-3 mb-3">
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-xl bg-white/95 backdrop-blur-sm border-2 border-white shadow-lg flex items-center justify-center">
            <span className="text-primary font-bold text-xl">
              {profile?.first_name?.[0] || 'U'}{profile?.last_name?.[0] || ''}
            </span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-primary rounded-full shadow-md"></div>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-sm font-bold text-white truncate mb-0.5">
            {profile?.first_name && profile?.last_name 
              ? `${profile.first_name} ${profile.last_name}`
              : profile?.first_name || 'Utente'}
          </span>
          <span className={`text-xs font-semibold text-white px-2 py-0.5 rounded-md ${getRoleBadgeColor(profile?.role || '')} w-fit capitalize`}>
            {profile?.role || ''}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-2 border-t border-white/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
          <span className="text-xs text-white/70 font-medium">Online</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white/80 hover:text-white hover:bg-white/20 w-8 h-8 rounded-lg transition-all duration-200"
          onClick={() => signOut()}
          title="Esci"
        >
          <LogOut size={14} />
        </Button>
      </div>
    </div>
  );
}
