import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X } from "lucide-react";

interface ServizioHeaderProps {
  numeroServizio?: string;
  stato: string;
  onBack?: () => void;
  onClose: () => void;
  isMobile?: boolean;
}

const getStatoBadge = (stato: string) => {
  switch (stato) {
    case 'assegnato':
      return { label: 'ASSEGNATO', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    case 'completato':
      return { label: 'COMPLETATO', className: 'bg-green-100 text-green-800 border-green-300' };
    case 'consuntivato':
      return { label: 'CONSUNTIVATO', className: 'bg-blue-100 text-blue-800 border-blue-300' };
    default:
      return { label: stato.toUpperCase(), className: 'bg-gray-100 text-gray-800' };
  }
};

export function ServizioHeader({ 
  numeroServizio, 
  stato, 
  onBack, 
  onClose,
  isMobile 
}: ServizioHeaderProps) {
  const badge = getStatoBadge(stato);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isMobile && onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h2 className="text-lg font-semibold">
            Servizio {numeroServizio ? `#${numeroServizio.substring(0, 8)}` : ''}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <Badge className={`${badge.className} text-base px-4 py-1.5`}>
        {badge.label}
      </Badge>
    </div>
  );
}
