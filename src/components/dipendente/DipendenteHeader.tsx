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
    <header className="sticky top-0 z-40 w-full border-b bg-gradient-to-r from-primary/5 via-background to-secondary/5 backdrop-blur-sm shadow-sm">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Logo + Menu Toggle */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onMenuToggle} className="touch-manipulation">
            <Menu className="h-6 w-6" />
          </Button>
          <Link to="/dipendente/dashboard">
            <h1 className="text-lg font-bold">TAXITIME</h1>
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
            <AvatarFallback className="text-sm">
              {profile?.first_name?.[0]}{profile?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
