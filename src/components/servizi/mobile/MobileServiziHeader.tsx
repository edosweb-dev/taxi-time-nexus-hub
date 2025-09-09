import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileServiziHeaderProps {
  isAdminOrSocio: boolean;
  onNavigateToNewServizio: () => void;
}

export function MobileServiziHeader({ 
  isAdminOrSocio, 
  onNavigateToNewServizio 
}: MobileServiziHeaderProps) {
  return (
    <div className="bg-primary text-primary-foreground px-2 py-2 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold">Servizi</h1>
        {isAdminOrSocio && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onNavigateToNewServizio}
            className="text-xs px-2 py-1 h-6"
          >
            <Plus className="h-3 w-3 mr-1" />
            Nuovo
          </Button>
        )}
      </div>
    </div>
  );
}