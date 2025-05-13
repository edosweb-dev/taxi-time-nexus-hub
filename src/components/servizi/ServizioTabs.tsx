
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Servizio } from "@/lib/types/servizi";

interface ServizioTabsProps {
  servizi: Servizio[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const ServizioTabs = ({
  servizi,
  activeTab,
  onTabChange
}: ServizioTabsProps) => {
  // Count servizi by status
  const counts = {
    da_assegnare: servizi.filter(s => s.stato === "da_assegnare").length,
    assegnato: servizi.filter(s => s.stato === "assegnato").length,
    completato: servizi.filter(s => s.stato === "completato").length,
    annullato: servizi.filter(s => s.stato === "annullato").length,
    non_accettato: servizi.filter(s => s.stato === "non_accettato").length,
  };

  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="space-x-1">
        <TabsTrigger value="da_assegnare">
          Da assegnare ({counts.da_assegnare})
        </TabsTrigger>
        <TabsTrigger value="assegnato">
          Assegnati ({counts.assegnato})
        </TabsTrigger>
        <TabsTrigger value="completato">
          Completati ({counts.completato})
        </TabsTrigger>
        <TabsTrigger value="non_accettato">
          Non accettati ({counts.non_accettato})
        </TabsTrigger>
        <TabsTrigger value="annullato">
          Annullati ({counts.annullato})
        </TabsTrigger>
        <TabsTrigger value="calendario">
          Calendario
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
