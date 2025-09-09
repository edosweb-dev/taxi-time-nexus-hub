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
    <div className="bg-primary text-primary-foreground p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Servizi</h1>
        {isAdminOrSocio && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onNavigateToNewServizio}
            className="text-xs"
          >
            <Plus className="h-4 w-4 mr-1" />
            Nuovo
          </Button>
        )}
      </div>
    </div>
  );
}