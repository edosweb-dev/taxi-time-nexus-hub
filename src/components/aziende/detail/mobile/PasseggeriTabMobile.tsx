import { useState } from 'react';
import { Plus, Mail, Phone, Edit, Trash2, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Profile } from '@/lib/types';
import { Passeggero } from '@/lib/api/passeggeri';

interface PasseggeriTabMobileProps {
  passeggeri: Passeggero[];
  referenti: Profile[];
  aziendaId: string;
  onAdd?: () => void;
  onEdit?: (passeggero: Passeggero) => void;
  onDelete?: (passeggero: Passeggero) => void;
}

export function PasseggeriTabMobile({ 
  passeggeri, 
  referenti, 
  aziendaId,
  onAdd,
  onEdit,
  onDelete 
}: PasseggeriTabMobileProps) {
  const [selectedReferente, setSelectedReferente] = useState<string>('all');

  const filteredPasseggeri = selectedReferente === 'all'
    ? passeggeri
    : selectedReferente === 'none'
    ? passeggeri.filter(p => !p.created_by_referente_id)
    : passeggeri.filter(p => p.created_by_referente_id === selectedReferente);

  return (
    <>
      {/* Header con count e bottone aggiungi */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">
            {filteredPasseggeri.length} Passeggeri
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {selectedReferente === 'all' 
              ? 'Tutti i passeggeri' 
              : selectedReferente === 'none'
              ? 'Senza referente'
              : 'Filtrati per referente'
            }
          </p>
        </div>
        {onAdd && (
          <Button onClick={onAdd} size="sm" className="flex-shrink-0 min-h-[48px] px-4 shadow-sm active:scale-95 transition-transform">
            <Plus className="h-4 w-4 mr-2" />
            Nuovo
          </Button>
        )}
      </div>

      {/* Filtri chip scroll orizzontale */}
      {referenti.length > 0 && (
        <div 
          className="flex gap-2.5 pb-4 mb-5 border-b overflow-x-auto no-scrollbar"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <button
            onClick={() => setSelectedReferente('all')}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold
              whitespace-nowrap transition-all min-h-[48px] flex-shrink-0 shadow-sm
              active:scale-95
              ${selectedReferente === 'all'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted text-muted-foreground'
              }
            `}
          >
            Tutti
            <Badge 
              variant={selectedReferente === 'all' ? 'secondary' : 'outline'} 
              className="ml-1"
            >
              {passeggeri.length}
            </Badge>
          </button>

          <button
            onClick={() => setSelectedReferente('none')}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold
              whitespace-nowrap transition-all min-h-[48px] flex-shrink-0 shadow-sm
              active:scale-95
              ${selectedReferente === 'none'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted text-muted-foreground'
              }
            `}
          >
            Senza Ref.
            <Badge 
              variant={selectedReferente === 'none' ? 'secondary' : 'outline'} 
              className="ml-1"
            >
              {passeggeri.filter(p => !p.created_by_referente_id).length}
            </Badge>
          </button>

          {referenti.map((ref) => {
            const count = passeggeri.filter(p => p.created_by_referente_id === ref.id).length;
            if (count === 0) return null;

            return (
              <button
                key={ref.id}
                onClick={() => setSelectedReferente(ref.id)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold
                  whitespace-nowrap transition-all min-h-[48px] flex-shrink-0 shadow-sm
                  active:scale-95
                  ${selectedReferente === ref.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted text-muted-foreground'
                  }
                `}
              >
                {ref.first_name || 'Ref'}
                <Badge 
                  variant={selectedReferente === ref.id ? 'secondary' : 'outline'} 
                  className="ml-1"
                >
                  {count}
                </Badge>
              </button>
            );
          })}
        </div>
      )}

      {/* Lista passeggeri */}
      {filteredPasseggeri.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground animate-fade-in">
          <div className="mx-auto w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-4">
            <UserCircle2 className="h-10 w-10 opacity-40" />
          </div>
          <p className="text-sm font-semibold">Nessun passeggero</p>
          {selectedReferente !== 'all' && (
            <p className="text-xs mt-2 max-w-[240px] mx-auto leading-relaxed">Nessun passeggero trovato per questo filtro</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPasseggeri.map((passeggero) => (
            <div
              key={passeggero.id}
              className="mobile-card animate-fade-in hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2.5 rounded-full bg-purple-100 text-purple-600 flex-shrink-0 shadow-sm">
                  <UserCircle2 className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-base">{passeggero.nome_cognome}</h4>
                  {passeggero.email && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                      <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{passeggero.email}</span>
                    </div>
                  )}
                  {passeggero.telefono && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
                      <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{passeggero.telefono}</span>
                    </div>
                  )}
                  {passeggero.created_by_referente_id && (() => {
                    const ref = referenti.find(r => r.id === passeggero.created_by_referente_id);
                    return ref ? (
                      <Badge variant="outline" className="mt-2.5 text-[11px] font-medium">
                        Ref: {ref.first_name} {ref.last_name}
                      </Badge>
                    ) : null;
                  })()}
                </div>
              </div>

              {/* Actions touch-friendly */}
              {(onEdit || onDelete) && (
                <div className="flex gap-2.5 pt-4 border-t">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(passeggero)}
                      className="flex-1 min-h-[48px] font-medium active:scale-95 transition-transform"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifica
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(passeggero)}
                      className="min-h-[48px] px-5 active:scale-95 transition-transform"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
