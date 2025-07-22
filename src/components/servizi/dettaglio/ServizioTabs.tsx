
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Servizio, PasseggeroConDettagli } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { ServizioInfoTab } from "@/components/servizi/dettaglio/ServizioInfoTab";
import { ServizioPasseggeriTab } from "@/components/servizi/dettaglio/ServizioPasseggeriTab";

interface ServizioTabsProps {
  servizio: Servizio;
  passeggeri: PasseggeroConDettagli[];
  users: Profile[];
  activeTab: string;
  onTabChange: (value: string) => void;
  getAziendaName: (aziendaId?: string) => string;
  getUserName: (users: Profile[], userId?: string) => string | null;
  formatCurrency: (value?: number) => string;
}

export function ServizioTabs({
  servizio,
  passeggeri,
  users,
  activeTab,
  onTabChange,
  getAziendaName,
  getUserName,
  formatCurrency,
}: ServizioTabsProps) {
  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <div className="border-b bg-muted/30 px-6">
          <TabsList className="bg-transparent border-none h-12 w-full justify-start p-0">
            <TabsTrigger 
              value="info" 
              className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent py-3 px-4"
            >
              <div className="flex items-center gap-2">
                <span>Informazioni del servizio</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="passeggeri"
              className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent py-3 px-4"
            >
              <div className="flex items-center gap-2">
                <span>Passeggeri</span>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
                  {passeggeri.length}
                </span>
              </div>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="info" className="p-6 m-0">
          <ServizioInfoTab 
            servizio={servizio}
            passeggeri={passeggeri}
            users={users}
            getAziendaName={getAziendaName}
            getUserName={getUserName}
            formatCurrency={formatCurrency}
          />
        </TabsContent>
        
        <TabsContent value="passeggeri" className="p-6 m-0">
          <ServizioPasseggeriTab
            passeggeri={passeggeri}
            servizioPresa={servizio.indirizzo_presa}
            servizioDestinazione={servizio.indirizzo_destinazione}
            servizioOrario={servizio.orario_servizio}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
