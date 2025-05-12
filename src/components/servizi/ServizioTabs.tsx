
import { Servizio } from "@/lib/types/servizi";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserX, CheckCircle, XCircle } from "lucide-react";
import { groupServiziByStatus } from "./utils";

interface ServizioTabsProps {
  servizi: Servizio[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const ServizioTabs = ({ servizi, activeTab, onTabChange }: ServizioTabsProps) => {
  const serviziByStatus = groupServiziByStatus(servizi);

  return (
    <TabsList className="grid grid-cols-5 mb-8">
      <TabsTrigger value="da_assegnare" className="flex gap-2">
        <Users className="h-4 w-4" />
        <span className="hidden sm:inline">Da assegnare</span>
        <Badge variant="outline" className="ml-1">{serviziByStatus.da_assegnare.length}</Badge>
      </TabsTrigger>
      <TabsTrigger value="assegnato" className="flex gap-2">
        <UserCheck className="h-4 w-4" />
        <span className="hidden sm:inline">Assegnati</span>
        <Badge variant="outline" className="ml-1">{serviziByStatus.assegnato.length}</Badge>
      </TabsTrigger>
      <TabsTrigger value="non_accettato" className="flex gap-2">
        <UserX className="h-4 w-4" />
        <span className="hidden sm:inline">Non accettati</span>
        <Badge variant="outline" className="ml-1">{serviziByStatus.non_accettato.length}</Badge>
      </TabsTrigger>
      <TabsTrigger value="completato" className="flex gap-2">
        <CheckCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Completati</span>
        <Badge variant="outline" className="ml-1">{serviziByStatus.completato.length}</Badge>
      </TabsTrigger>
      <TabsTrigger value="annullato" className="flex gap-2">
        <XCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Annullati</span>
        <Badge variant="outline" className="ml-1">{serviziByStatus.annullato.length}</Badge>
      </TabsTrigger>
    </TabsList>
  );
};
