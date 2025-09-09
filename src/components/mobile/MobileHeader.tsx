import React from 'react';
import { Menu, ArrowLeft, Search, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface MobileHeaderProps {
  title: string;
  onMenuToggle?: () => void;
  showBack?: boolean;
  showSearch?: boolean;
  onSearch?: () => void;
}

export function MobileHeader({ 
  title, 
  onMenuToggle, 
  showBack = false,
  showSearch = false,
  onSearch
}: MobileHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();

  const getInitials = () => {
    if (!profile?.first_name && !profile?.last_name) return 'U';
    return `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`.toUpperCase();
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="
      sticky top-0 z-50 w-full
      bg-background/95 backdrop-blur-md border-b border-border/40
      animate-fade-in
    ">
      {/* Main header content */}
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left section */}
        <div className="flex items-center gap-3">
          {showBack ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="
                w-10 h-10 rounded-full 
                hover:bg-muted/50 active:scale-95 
                transition-all duration-200 
                touch-manipulation
              "
              aria-label="Torna indietro"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuToggle}
              className="
                w-10 h-10 rounded-full 
                hover:bg-muted/50 active:scale-95 
                transition-all duration-200 
                touch-manipulation
              "
              aria-label="Apri menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}

          <div className="flex flex-col justify-center min-w-0">
            <h1 className="
              text-lg font-semibold text-foreground 
              truncate leading-tight
            ">
              {title}
            </h1>
            <div className="text-xs text-muted-foreground font-medium">
              TAXITIME
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {showSearch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSearch}
              className="
                w-10 h-10 rounded-full 
                hover:bg-muted/50 active:scale-95 
                transition-all duration-200 
                touch-manipulation
              "
              aria-label="Cerca"
            >
              <Search className="w-4 h-4" />
            </Button>
          )}

          {/* User Profile */}
          <div className="flex items-center gap-2 ml-2">
            <Avatar className="w-8 h-8 border border-border/20 hover-scale">
              <AvatarFallback className="
                bg-primary/10 text-primary 
                text-xs font-medium
                transition-colors duration-200
              ">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            
            <Button
              variant="ghost"
              size="sm"
              className="
                w-8 h-8 rounded-full p-0
                hover:bg-muted/50 active:scale-95 
                transition-all duration-200 
                touch-manipulation
              "
              aria-label="Opzioni utente"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Subtle progress bar for visual feedback */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
    </div>
  );
}