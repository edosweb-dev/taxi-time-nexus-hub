import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Home, Calendar, Clock, DollarSign, Euro, User, MessageCircle, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DipendenteMobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function DipendenteMobileSidebar({ open, onClose }: DipendenteMobileSidebarProps) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
      onClose();
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Errore durante il logout');
    }
  };

  const menuSections = [
    {
      title: 'Principale',
      items: [
        { icon: Home, label: 'Dashboard', path: '/dipendente/dashboard' },
        { icon: Calendar, label: 'Servizi Assegnati', path: '/dipendente/servizi-assegnati' },
        { icon: Clock, label: 'Turni', path: '/dipendente/turni' }
      ]
    },
    {
      title: 'Gestione Personale',
      items: [
        { icon: DollarSign, label: 'Spese', path: '/dipendente/spese' },
        { icon: Euro, label: 'Stipendi', path: '/dipendente/stipendi' }
      ]
    },
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profilo', path: '/profile' },
        { icon: MessageCircle, label: 'Feedback', path: '/feedback' }
      ]
    }
  ];

  return (
    <>
      {/* Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-50 bg-black/20 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed top-0 left-0 h-full w-80 max-w-[85vw] z-50 bg-background border-r shadow-2xl transform transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header with Profile */}
        <div className="bg-primary text-primary-foreground p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">TAXITIME</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-primary-foreground hover:bg-primary-foreground/10">
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-primary-foreground/10 text-primary-foreground">
                {profile?.first_name?.[0]}{profile?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-sm opacity-70">Dipendente</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {menuSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3 px-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <button
                      key={item.path}
                      onClick={() => { 
                        navigate(item.path); 
                        onClose(); 
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all touch-manipulation min-h-[44px]",
                        isActive
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted"
                      )}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        
        {/* Footer with Logout */}
        <div className="p-4 border-t">
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 min-h-[44px] touch-manipulation"
          >
            <LogOut className="h-5 w-5" />
            <span>Esci</span>
          </Button>
        </div>
      </div>
    </>
  );
}
