import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface TabItem {
  id: string;
  label: string;
  count: number;
}

interface MobileServiziTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileServiziTabs({ 
  tabs, 
  activeTab, 
  onTabChange 
}: MobileServiziTabsProps) {
  return (
    <div className="border-b bg-card">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
                "hover:bg-muted/50",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              )}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <Badge 
                  variant={activeTab === tab.id ? "secondary" : "outline"}
                  className="text-xs h-5 px-1.5"
                >
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}