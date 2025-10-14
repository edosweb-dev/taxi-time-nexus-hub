import { useAuth } from "@/contexts/AuthContext";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Home, Calendar, Clock, DollarSign, Euro, User, MessageCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter,
  useSidebar 
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function DipendenteSidebar() {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();

  const handleLogout = async () => {
    await signOut();
  };

  const navItems = [
    { title: 'Dashboard', href: '/dipendente/dashboard', icon: Home },
    { title: 'Servizi Assegnati', href: '/dipendente/servizi-assegnati', icon: Calendar },
    { title: 'Turni', href: '/dipendente/turni', icon: Clock },
    { title: 'Spese', href: '/dipendente/spese', icon: DollarSign },
    { title: 'Stipendi', href: '/dipendente/stipendi', icon: Euro },
    { title: 'Profilo', href: '/profile', icon: User },
    { title: 'Feedback', href: '/feedback', icon: MessageCircle }
  ];

  return (
    <Sidebar className="border-r border-border/50" collapsible="icon">
      <div className="flex flex-col h-full bg-gradient-to-b from-primary to-primary/90 text-white">
        
        {/* Header */}
        <SidebarHeader className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            {state !== "collapsed" && (
              <div>
                <p className="font-bold text-white">TAXITIME</p>
                <p className="text-xs text-white/60">Dipendente</p>
              </div>
            )}
          </div>
        </SidebarHeader>
        
        {/* Navigation */}
        <SidebarContent className="flex-1 overflow-y-auto py-4">
          <TooltipProvider delayDuration={0}>
            <div className="space-y-1 px-3">
              {navItems.slice(0, 5).map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                
                const linkContent = (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                      isActive
                        ? "bg-white text-primary shadow-md"
                        : "text-white/80 hover:text-white hover:bg-white/15"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive ? "text-primary" : "text-white/80"
                    )} />
                    {state !== "collapsed" && (
                      <span className="font-medium">{item.title}</span>
                    )}
                  </Link>
                );

                return state === "collapsed" ? (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      {linkContent}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  linkContent
                );
              })}

              {/* Separatore */}
              <div className="border-t border-white/10 my-2" />

              {navItems.slice(5).map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                
                const linkContent = (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                      isActive
                        ? "bg-white text-primary shadow-md"
                        : "text-white/80 hover:text-white hover:bg-white/15"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive ? "text-primary" : "text-white/80"
                    )} />
                    {state !== "collapsed" && (
                      <span className="font-medium">{item.title}</span>
                    )}
                  </Link>
                );

                return state === "collapsed" ? (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      {linkContent}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  linkContent
                );
              })}

              {/* Logout Button */}
              {state === "collapsed" ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleLogout}
                      className="w-full text-white/80 hover:text-white hover:bg-white/15 mt-2"
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Esci</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start gap-3 px-3 py-2.5 text-white/80 hover:text-white hover:bg-white/15 mt-2"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Esci</span>
                </Button>
              )}
            </div>
          </TooltipProvider>
        </SidebarContent>
        
        {/* Footer with Profile */}
        <SidebarFooter className="p-4 border-t border-white/10">
          {state !== "collapsed" ? (
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-white/10">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarFallback className="bg-white/20 text-white">
                  {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {profile?.first_name} {profile?.last_name}
                </p>
                {profile?.color && (
                  <Badge 
                    style={{ backgroundColor: profile.color }}
                    className="text-white text-xs mt-1"
                  >
                    Dipendente
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-white/20 text-white">
                  {profile?.first_name?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
