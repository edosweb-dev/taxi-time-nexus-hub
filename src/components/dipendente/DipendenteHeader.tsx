import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";

interface DipendenteHeaderProps {
  onMenuToggle: () => void;
}

export function DipendenteHeader({ onMenuToggle }: DipendenteHeaderProps) {
  const { profile } = useAuth();
  
  return (
    <div className="w-full sticky top-0 z-50 bg-primary text-primary-foreground shadow-md border-b border-primary/20">
      {/* Main header content */}
      <div className="flex h-16 items-center justify-between px-4">
        {/* Logo + Menu Toggle */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onMenuToggle} 
            className="w-10 h-10 rounded-full text-primary-foreground hover:bg-primary-foreground/20 active:scale-95 transition-all duration-200 touch-manipulation"
            aria-label="Apri menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <Link to="/dipendente/dashboard">
            <h1 className="text-lg font-bold text-primary-foreground leading-tight tracking-wide">TAXITIME</h1>
          </Link>
        </div>
        
        {/* Profile + Color Badge */}
        <div className="flex items-center gap-3">
          {profile?.color && (
            <Badge 
              style={{ backgroundColor: profile.color }}
              className="text-white text-xs font-medium hidden sm:inline-flex"
            >
              {profile.first_name}
            </Badge>
          )}
          <Avatar className="h-9 w-9">
            <AvatarFallback className="text-sm bg-primary-foreground/20 text-primary-foreground">
              {profile?.first_name?.[0]}{profile?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Decorative bottom accent */}
      <div className="h-1 bg-gradient-to-r from-primary-foreground/20 via-primary-foreground/40 to-primary-foreground/20"></div>
    </div>
  );
}
