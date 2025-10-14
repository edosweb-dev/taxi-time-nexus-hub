import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { UserX, AlertTriangle } from 'lucide-react';

export function ImpersonationBanner() {
  const { isImpersonating, profile, stopImpersonation } = useAuth();

  if (!isImpersonating || !profile) {
    return null;
  }

  return (
    <div className="bg-warning text-warning-foreground px-3 py-2 sm:px-4 sm:py-3 flex items-center justify-between gap-2 border-b shadow-sm">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
        <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
          <span className="font-medium text-xs sm:text-sm truncate">
            Modalità Impersonificazione
          </span>
          <span className="text-xs sm:text-sm opacity-90 truncate">
            <strong>{profile.first_name} {profile.last_name}</strong>
            <span className="hidden sm:inline"> ({profile.role})</span>
          </span>
        </div>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          if (confirm('Vuoi davvero uscire dall\'impersonation e tornare al tuo account admin?')) {
            stopImpersonation();
          }
        }}
        className="bg-background/10 border-current hover:bg-background/20 text-current flex-shrink-0"
      >
        <UserX className="h-4 w-4" />
        <span className="hidden sm:inline sm:ml-2">Torna al tuo account</span>
      </Button>
    </div>
  );
}