
import { Loader2 } from 'lucide-react';
import { Profile } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DipendenteSelectFormProps {
  isLoadingAvailableUsers: boolean;
  selectedDipendente: string;
  setSelectedDipendente: (value: string) => void;
  availableUsers?: Profile[];
  unavailableUsers?: Profile[];
}

export function DipendenteSelectForm({
  isLoadingAvailableUsers,
  selectedDipendente,
  setSelectedDipendente,
  availableUsers = [],
  unavailableUsers = []
}: DipendenteSelectFormProps) {
  const getRoleName = (role: string) => {
    switch(role) {
      case 'admin': return 'Amministratore';
      case 'socio': return 'Socio';
      default: return 'Dipendente';
    }
  };
  
  return (
    <div className="grid w-full items-center gap-1.5">
      <Label htmlFor="dipendente-select">Seleziona Dipendente</Label>
      <Select value={selectedDipendente} onValueChange={setSelectedDipendente}>
        <SelectTrigger id="dipendente-select">
          <SelectValue placeholder="Seleziona un dipendente" />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          {isLoadingAvailableUsers ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : availableUsers.length > 0 ? (
            <>
              <div className="p-2 text-sm font-medium text-foreground bg-muted/50">
                Dipendenti disponibili
              </div>
              {availableUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.first_name} {user.last_name} ({getRoleName(user.role)})
                </SelectItem>
              ))}
              
              {/* Show unavailable users separately */}
              {unavailableUsers.length > 0 && (
                <>
                  <div className="p-2 text-sm font-medium text-foreground bg-muted/50 mt-2">
                    Dipendenti non disponibili
                  </div>
                  {unavailableUsers.map((user) => (
                    <SelectItem 
                      key={user.id} 
                      value={user.id} 
                      disabled 
                      className="text-muted-foreground"
                    >
                      {user.first_name} {user.last_name} ({getRoleName(user.role)})
                    </SelectItem>
                  ))}
                </>
              )}
            </>
          ) : (
            <div className="p-2 text-center text-sm text-muted-foreground">
              Nessun dipendente disponibile
            </div>
          )}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground mt-1">
        I dipendenti non disponibili sono già assegnati, senza turno, o in malattia/ferie per questa data.
      </p>
    </div>
  );
}
