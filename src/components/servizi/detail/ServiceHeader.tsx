
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Servizio } from "@/lib/types/servizi";
import { getStatoBadge } from "@/components/servizi/utils/serviceUtils";

interface ServiceHeaderProps {
  servizio: Servizio;
  onNavigateBack: () => void;
}

export function ServiceHeader({ servizio, onNavigateBack }: ServiceHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <Button variant="ghost" onClick={onNavigateBack}>
        <ArrowLeft className="h-4 w-4 mr-1" />
        Torna ai servizi
      </Button>
      <div className="ml-auto flex items-center gap-2">
        {getStatoBadge(servizio.stato)}
      </div>
    </div>
  );
}
