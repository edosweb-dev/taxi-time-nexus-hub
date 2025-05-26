
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
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList>
        <TabsTrigger value="info">Informazioni</TabsTrigger>
        <TabsTrigger value="passeggeri">
          Passeggeri ({passeggeri.length})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="info" className="space-y-6">
        <ServizioInfoTab 
          servizio={servizio}
          passeggeri={passeggeri}
          users={users}
          getAziendaName={getAziendaName}
          getUserName={getUserName}
          formatCurrency={formatCurrency}
        />
      </TabsContent>
      
      <TabsContent value="passeggeri" className="space-y-4">
        <ServizioPasseggeriTab
          passeggeri={passeggeri}
          servizioPresa={servizio.indirizzo_presa}
          servizioDestinazione={servizio.indirizzo_destinazione}
          servizioOrario={servizio.orario_servizio}
        />
      </TabsContent>
    </Tabs>
  );
}
