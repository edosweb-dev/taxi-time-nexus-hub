import { useRef, useState } from 'react';
import { UserCircle2, Mail, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Profile } from '@/lib/types';
import { Passeggero } from '@/lib/api/passeggeri';

interface PasseggeriTabMobileProps {
  passeggeri: Passeggero[];
  referenti: Profile[];
}

export function PasseggeriTabMobile({ passeggeri, referenti }: PasseggeriTabMobileProps) {
  const [selectedReferente, setSelectedReferente] = useState<string>('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredPasseggeri = selectedReferente === 'all'
    ? passeggeri
    : selectedReferente === 'none'
    ? passeggeri.filter(p => !p.referente_id)
    : passeggeri.filter(p => p.referente_id === selectedReferente);

  return (
    <>
      {/* Header con count */}
      <div className="mb-4">
        <h3 className="font-semibold text-base">
          {filteredPasseggeri.length} Passeggeri
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {selectedReferente === 'all' 
            ? 'Tutti i passeggeri' 
            : selectedReferente === 'none'
            ? 'Senza referente'
            : 'Filtrati per referente'
          }
        </p>
      </div>

      {/* Filtri chip scroll orizzontale */}
      {referenti.length > 0 && (
        <div 
          ref={scrollRef}
          className="flex gap-2 pb-3 mb-4 border-b overflow-x-auto no-scrollbar"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <button
            onClick={() => setSelectedReferente('all')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
              whitespace-nowrap transition-all min-h-[44px] flex-shrink-0
              ${selectedReferente === 'all'
                ? 'bg-primary text-primary-foreground'
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
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
              whitespace-nowrap transition-all min-h-[44px] flex-shrink-0
              ${selectedReferente === 'none'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
              }
            `}
          >
            Senza Ref.
            <Badge 
              variant={selectedReferente === 'none' ? 'secondary' : 'outline'} 
              className="ml-1"
            >
              {passeggeri.filter(p => !p.referente_id).length}
            </Badge>
          </button>

          {referenti.map((ref) => {
            const count = passeggeri.filter(p => p.referente_id === ref.id).length;
            if (count === 0) return null;

            return (
              <button
                key={ref.id}
                onClick={() => setSelectedReferente(ref.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                  whitespace-nowrap transition-all min-h-[44px] flex-shrink-0
                  ${selectedReferente === ref.id
                    ? 'bg-primary text-primary-foreground'
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
        <div className="text-center py-12 text-muted-foreground">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-3">
            <UserCircle2 className="h-8 w-8 opacity-50" />
          </div>
          <p className="text-sm font-medium">Nessun passeggero</p>
          {selectedReferente !== 'all' && (
            <p className="text-xs mt-1">Nessun passeggero trovato per questo filtro</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPasseggeri.map((passeggero) => (
            <div
              key={passeggero.id}
              className="mobile-card"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-purple-100 text-purple-600 flex-shrink-0">
                  <UserCircle2 className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{passeggero.nome}</h4>
                  {passeggero.email && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{passeggero.email}</span>
                    </div>
                  )}
                  {passeggero.telefono && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Phone className="h-3 w-3 flex-shrink-0" />
                      <span>{passeggero.telefono}</span>
                    </div>
                  )}
                  {passeggero.referente_id && (() => {
                    const ref = referenti.find(r => r.id === passeggero.referente_id);
                    return ref ? (
                      <Badge variant="outline" className="mt-2 text-xs">
                        Ref: {ref.first_name} {ref.last_name}
                      </Badge>
                    ) : null;
                  })()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
