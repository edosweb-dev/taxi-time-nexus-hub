
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

export function SidebarHeader() {
  const { state } = useSidebar();
  
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-primary/10 backdrop-blur-sm border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-white to-white/90 flex items-center justify-center shadow-md">
            <span className="text-primary font-bold text-lg tracking-tight">T</span>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent rounded-full border border-primary flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
          </div>
        </div>
        {state !== "collapsed" && (
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-wide text-white">TAXITIME</span>
            <span className="text-xs text-white/60 font-medium tracking-wide uppercase">Dashboard</span>
          </div>
        )}
      </div>
      {state !== "collapsed" && (
        <div className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full shadow-sm"></div>
          <span className="text-xs text-white/50 font-medium">Online</span>
        </div>
      )}
    </div>
  );
}
