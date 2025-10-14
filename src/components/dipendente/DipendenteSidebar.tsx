import { useAuth } from "@/contexts/AuthContext";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Home, Calendar, Clock, DollarSign, Euro, User } from "lucide-react";
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

export function DipendenteSidebar() {
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();

  const navItems = [
    { title: 'Dashboard', href: '/dipendente/dashboard', icon: Home },
    { title: 'Servizi Assegnati', href: '/dipendente/servizi-assegnati', icon: Calendar },
    { title: 'Turni', href: '/dipendente/turni', icon: Clock },
    { title: 'Spese', href: '/dipendente/spese', icon: DollarSign },
    { title: 'Stipendi', href: '/dipendente/stipendi', icon: Euro },
    { title: 'Profilo', href: '/profile', icon: User }
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
            </div>
          </TooltipProvider>
        </SidebarContent>
        
        {/* Footer with Profile */}
        <SidebarFooter className="p-4 border-t border-white/10">
          {state !== "collapsed" ? (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/30 shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-white backdrop-blur-sm border-2 border-white shadow-lg flex items-center justify-center">
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
                  <span className="text-xs font-semibold text-white px-2 py-0.5 rounded-md bg-green-500/90 w-fit capitalize">
                    Dipendente
                  </span>
                </div>
              </div>
              
              <div className="flex items-center pt-2 border-t border-white/20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
                  <span className="text-xs text-white/70 font-medium">Online</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-white backdrop-blur-sm border-2 border-white shadow-lg flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">
                    {profile?.first_name?.[0] || 'U'}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-primary rounded-full shadow-md"></div>
              </div>
            </div>
          )}
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
