import React from 'react';
import { Menu, ArrowLeft, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface MobileHeaderProps {
  title: string;
  onMenuToggle?: () => void;
  showBack?: boolean;
  showSearch?: boolean;
  showNotifications?: boolean;
  variant?: 'default' | 'transparent' | 'accent';
}

export function MobileHeader({ 
  title, 
  onMenuToggle, 
  showBack = false,
  showSearch = false,
  showNotifications = false,
  variant = 'default'
}: MobileHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();

  const getVariantClasses = () => {
    switch (variant) {
      case 'transparent':
        return 'bg-background/80 backdrop-blur-md border-b border-border/50';
      case 'accent':
        return 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg';
      default:
        return 'bg-primary text-primary-foreground shadow-md';
    }
  };

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
    <div className={`
      mobile-header relative overflow-hidden
      ${getVariantClasses()}
      flex items-center justify-between px-4 py-3 min-h-[64px]
      transition-all duration-300 ease-in-out
    `}>
      {/* Background decoration */}
      {variant === 'accent' && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
        </div>
      )}

      {/* Left section */}
      <div className="flex items-center gap-3 relative z-10">
        {showBack ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className={`
              p-2 rounded-full transition-all duration-200 
              ${variant === 'accent' 
                ? 'text-primary-foreground hover:bg-primary-foreground/20' 
                : 'text-foreground hover:bg-muted'
              }
              active:scale-95 touch-manipulation
            `}
            aria-label="Torna indietro"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className={`
              p-2 rounded-full transition-all duration-200 
              ${variant === 'accent' 
                ? 'text-primary-foreground hover:bg-primary-foreground/20' 
                : 'text-foreground hover:bg-muted'
              }
              active:scale-95 touch-manipulation
            `}
            aria-label="Apri menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}

        <div className="flex flex-col">
          <h1 className="text-lg font-bold leading-tight line-clamp-1">
            {title}
          </h1>
          {location.pathname !== '/dashboard' && (
            <div className="text-xs opacity-75 font-medium">
              TAXITIME
            </div>
          )}
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 relative z-10">
        {showSearch && (
          <Button
            variant="ghost"
            size="sm"
            className={`
              p-2 rounded-full transition-all duration-200 
              ${variant === 'accent' 
                ? 'text-primary-foreground hover:bg-primary-foreground/20' 
                : 'text-foreground hover:bg-muted'
              }
              active:scale-95 touch-manipulation
            `}
            aria-label="Cerca"
          >
            <Search className="w-5 h-5" />
          </Button>
        )}

        {showNotifications && (
          <Button
            variant="ghost"
            size="sm"
            className={`
              p-2 rounded-full transition-all duration-200 relative
              ${variant === 'accent' 
                ? 'text-primary-foreground hover:bg-primary-foreground/20' 
                : 'text-foreground hover:bg-muted'
              }
              active:scale-95 touch-manipulation
            `}
            aria-label="Notifiche"
          >
            <Bell className="w-5 h-5" />
            {/* Notification dot */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-current"></div>
          </Button>
        )}

        {/* User avatar */}
        <Avatar className="w-8 h-8 border-2 border-current/20">
          <AvatarFallback className={`
            text-xs font-bold 
            ${variant === 'accent' 
              ? 'bg-primary-foreground text-primary' 
              : 'bg-primary text-primary-foreground'
            }
          `}>
            {getInitials()}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}