
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

export function SidebarHeader() {
  const { state } = useSidebar();
  
  return (
    <div className="flex items-center px-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary font-bold text-lg">
          T
        </div>
        {state !== "collapsed" && (
          <span className="font-semibold text-lg tracking-wide text-white">TAXITIME</span>
        )}
      </div>
    </div>
  );
}
