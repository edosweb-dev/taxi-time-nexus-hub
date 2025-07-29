import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { UserX, AlertTriangle } from 'lucide-react';

export function ImpersonationBanner() {
  const { isImpersonating, profile, stopImpersonation } = useAuth();

  if (!isImpersonating || !profile) {
    return null;
  }

  return (
    <div className="bg-warning text-warning-foreground px-4 py-3 flex items-center justify-between border-b shadow-sm">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5" />
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <span className="font-medium text-sm">
            Modalità Impersonificazione Attiva
          </span>
          <span className="text-sm opacity-90">
            Stai navigando come: <strong>{profile.first_name} {profile.last_name}</strong> ({profile.role})
          </span>
        </div>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={stopImpersonation}
        className="bg-background/10 border-current hover:bg-background/20 text-current"
      >
        <UserX className="h-4 w-4 mr-2" />
        Torna al tuo account
      </Button>
    </div>
  );
}