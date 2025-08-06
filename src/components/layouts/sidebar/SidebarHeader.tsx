
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

export function SidebarHeader() {
  const { state } = useSidebar();
  
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-primary/10 backdrop-blur-sm border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white to-white/90 flex items-center justify-center shadow-lg">
            <span className="text-primary font-bold text-xl tracking-tight">T</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-primary flex items-center justify-center">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>
        {state !== "collapsed" && (
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-wide text-white">TAXITIME</span>
            <span className="text-xs text-white/70 font-medium tracking-wider uppercase">Dashboard</span>
          </div>
        )}
      </div>
      {state !== "collapsed" && (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
          <span className="text-xs text-white/60 font-medium">Online</span>
        </div>
      )}
    </div>
  );
}
