import { Plus, Mail, Edit, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Profile } from '@/lib/types';

interface ReferentiTabMobileProps {
  referenti: Profile[];
  onAdd: () => void;
  onEdit: (referente: Profile) => void;
  onDelete: (referente: Profile) => void;
}

export function ReferentiTabMobile({ 
  referenti, 
  onAdd, 
  onEdit, 
  onDelete
}: ReferentiTabMobileProps) {
  const getUserInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || 'U';
  };

  return (
    <>
      {/* Header con add button */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-lg">
            {referenti.length} Referent{referenti.length !== 1 ? 'i' : 'e'}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Gestisci i contatti aziendali</p>
        </div>
        <Button onClick={onAdd} size="sm" className="min-h-[48px] px-4 shadow-sm active:scale-95 transition-transform">
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi
        </Button>
      </div>

      {/* Lista referenti */}
      {referenti.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground animate-fade-in">
          <div className="mx-auto w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-4">
            <Users className="h-10 w-10 opacity-40" />
          </div>
          <p className="text-sm font-semibold">Nessun referente</p>
          <p className="text-xs mt-2 max-w-[240px] mx-auto leading-relaxed">Aggiungi il primo referente per questa azienda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {referenti.map((referente) => (
            <div 
              key={referente.id}
              className="mobile-card animate-fade-in hover:shadow-md transition-shadow"
            >
              {/* Header con avatar */}
              <div className="flex items-start gap-3 mb-4">
                <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-sm">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                    {getUserInitials(referente.first_name, referente.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-base truncate">
                    {referente.first_name && referente.last_name 
                      ? `${referente.first_name} ${referente.last_name}`
                      : referente.first_name || referente.last_name || 'Nome non specificato'
                    }
                  </h4>
                  {referente.email && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                      <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{referente.email}</span>
                    </div>
                  )}
                  <Badge variant="secondary" className="mt-2.5 text-[11px] font-medium">
                    Referente
                  </Badge>
                </div>
              </div>

              {/* Actions touch-friendly */}
              <div className="flex gap-2.5 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(referente)}
                  className="flex-1 min-h-[48px] font-medium active:scale-95 transition-transform"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifica
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(referente)}
                  className="min-h-[48px] px-5 active:scale-95 transition-transform"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
