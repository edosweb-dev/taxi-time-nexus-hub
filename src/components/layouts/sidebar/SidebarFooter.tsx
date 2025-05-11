
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { User, LogOut } from "lucide-react";

export function SidebarFooterContent() {
  const { profile, signOut } = useAuth();
  
  return (
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
  );
}
