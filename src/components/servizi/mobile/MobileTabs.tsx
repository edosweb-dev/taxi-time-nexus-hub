import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MobileTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    count: number;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function MobileTabs({ tabs, activeTab, onTabChange }: MobileTabsProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap border rounded-lg">
      <div className="flex space-x-1 p-2 min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap min-w-0 flex-shrink-0",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            <span className="truncate">{tab.label}</span>
            <Badge 
              variant={activeTab === tab.id ? "secondary" : "outline"}
              className={cn(
                "text-xs px-1 py-0 ml-1 min-w-[1.25rem] h-4 flex items-center justify-center",
                activeTab === tab.id
                  ? "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20"
                  : "bg-background/80 text-muted-foreground border-border"
              )}
            >
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}