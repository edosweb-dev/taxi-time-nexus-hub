import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { List, Calendar } from "lucide-react";

interface ServiziTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
}

export const ServiziTabs = ({ activeTab, onTabChange, children }: ServiziTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <div className="sticky top-0 z-10 bg-background border-b">
        <TabsList className="w-full justify-start rounded-none h-12 bg-transparent p-0">
          <TabsTrigger 
            value="elenco" 
            className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12"
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Elenco</span>
          </TabsTrigger>
          <TabsTrigger 
            value="agenda" 
            className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Agenda</span>
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="elenco" className="mt-0">
        {children}
      </TabsContent>
      
      <TabsContent value="agenda" className="mt-6 p-6 text-center">
        <div className="space-y-4">
          <Calendar className="h-16 w-16 mx-auto text-muted-foreground" />
          <div>
            <h2 className="text-xl font-semibold mb-2">Vista Agenda</h2>
            <p className="text-muted-foreground">
              La vista calendario sarà disponibile a breve
            </p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};
