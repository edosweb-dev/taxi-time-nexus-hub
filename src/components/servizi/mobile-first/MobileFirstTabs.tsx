import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MobileFirstTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    count: number;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function MobileFirstTabs({ tabs, activeTab, onTabChange }: MobileFirstTabsProps) {
  return (
    <ScrollArea className="w-full">
      <div className="flex p-2 gap-2 min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap border",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            )}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <Badge 
                variant={activeTab === tab.id ? "secondary" : "outline"}
                className={cn(
                  "text-xs px-2 py-0.5 min-w-[1.5rem] h-5 flex items-center justify-center",
                  activeTab === tab.id
                    ? "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {tab.count}
              </Badge>
            )}
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}