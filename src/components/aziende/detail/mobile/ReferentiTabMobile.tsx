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
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-base">
          {referenti.length} Referent{referenti.length !== 1 ? 'i' : 'e'}
        </h3>
        <Button onClick={onAdd} size="sm" className="min-h-[44px]">
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi
        </Button>
      </div>

      {/* Lista referenti */}
      {referenti.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-3">
            <Users className="h-8 w-8 opacity-50" />
          </div>
          <p className="text-sm font-medium">Nessun referente</p>
          <p className="text-xs mt-1">Aggiungi il primo referente per questa azienda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {referenti.map((referente) => (
            <div 
              key={referente.id}
              className="mobile-card"
            >
              {/* Header con avatar */}
              <div className="flex items-start gap-3 mb-3">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {getUserInitials(referente.first_name, referente.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">
                    {referente.first_name && referente.last_name 
                      ? `${referente.first_name} ${referente.last_name}`
                      : referente.first_name || referente.last_name || 'Nome non specificato'
                    }
                  </h4>
                  {referente.email && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{referente.email}</span>
                    </div>
                  )}
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Referente
                  </Badge>
                </div>
              </div>

              {/* Actions touch-friendly */}
              <div className="flex gap-2 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(referente)}
                  className="flex-1 min-h-[44px]"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifica
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(referente)}
                  className="min-h-[44px] px-4"
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
