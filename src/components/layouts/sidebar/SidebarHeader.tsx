
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function SidebarHeader() {
  return (
    <div className="flex items-center px-4 border-b border-white/20">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary font-bold text-lg">
          T
        </div>
        <span className="font-semibold text-lg tracking-wide text-white">TAXITIME V2</span>
      </div>
      <Button variant="ghost" size="icon" className="ml-auto text-white hover:bg-white/20 hover:text-white">
        <Menu className="h-4 w-4" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>
    </div>
  );
}
