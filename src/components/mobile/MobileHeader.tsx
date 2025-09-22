import React from 'react';
import { Menu, Search, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

interface MobileHeaderProps {
  onMenuToggle?: () => void;
  showSearch?: boolean;
  onSearch?: () => void;
}

export function MobileHeader({ 
  onMenuToggle, 
  showSearch = false,
  onSearch
}: MobileHeaderProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const getInitials = () => {
    if (!profile?.first_name && !profile?.last_name) return 'U';
    return `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="
      sticky top-0 z-50 w-full
      bg-primary text-primary-foreground 
      shadow-md border-b border-primary/20
    ">
      {/* Main header content */}
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left section */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="
              w-10 h-10 rounded-full 
              text-primary-foreground hover:bg-primary-foreground/20 
              active:scale-95 transition-all duration-200 
              touch-manipulation
            "
            aria-label="Apri menu"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex flex-col justify-center">
            <h1 className="
              text-lg font-bold text-primary-foreground 
              leading-tight tracking-wide
            ">
              TAXITIME
            </h1>
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
                text-primary-foreground hover:bg-primary-foreground/20 
                active:scale-95 transition-all duration-200 
                touch-manipulation
              "
              aria-label="Cerca"
            >
              <Search className="w-4 h-4" />
            </Button>
          )}

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="
                  w-9 h-9 rounded-full p-0 
                  text-primary-foreground hover:bg-primary-foreground/20 
                  active:scale-95 transition-all duration-200 
                  touch-manipulation
                "
                aria-label="Menu utente"
              >
                <Avatar className="w-9 h-9 border-2 border-primary-foreground/20">
                  <AvatarFallback className="
                    bg-primary-foreground text-primary 
                    text-sm font-bold
                    transition-colors duration-200
                  ">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 mt-2"
              sideOffset={8}
            >
              <DropdownMenuItem 
                onClick={() => navigate('/profile')}
                className="cursor-pointer"
              >
                <User className="w-4 h-4 mr-2" />
                Profilo e Impostazioni
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={signOut}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Decorative bottom accent */}
      <div className="h-1 bg-gradient-to-r from-primary-foreground/20 via-primary-foreground/40 to-primary-foreground/20"></div>
    </div>
  );
}