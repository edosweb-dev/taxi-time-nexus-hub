import { useState, useMemo } from 'react';
import { ConducenteEsternoList } from './ConducenteEsternoList';
import { ConducentiEsterniStats } from './ConducentiEsterniStats';
import { ConducenteEsternoSheet } from './ConducenteEsternoSheet';
import { ConducenteEsternoCardEnhanced } from './ConducenteEsternoCardEnhanced';
import { SmartSearchBar } from './SmartSearchBar';
import { QuickFilterTabs } from './QuickFilterTabs';
import { FloatingActionButton } from './FloatingActionButton';
import { ConducenteEsterno } from '@/lib/types/conducenti-esterni';
import { useConducentiEsterni, useDeleteConducenteEsterno, useReactivateConducenteEsterno } from '@/hooks/useConducentiEsterni';
import { useDebounce } from '@/hooks/useDebounce';
import { UserX } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConducentiEsterniContentProps {
  onEdit: (conducente: ConducenteEsterno) => void;
  onAddConducente: () => void;
  isSheetOpen: boolean;
  setIsSheetOpen: (open: boolean) => void;
  selectedConducente: ConducenteEsterno | null;
  mode: 'create' | 'edit';
}

export function ConducentiEsterniContent({
  onEdit,
  onAddConducente,
  isSheetOpen,
  setIsSheetOpen,
  selectedConducente,
  mode,
}: ConducentiEsterniContentProps) {
  const { data: conducenti = [], isLoading } = useConducentiEsterni();
  const { mutate: deleteConducente } = useDeleteConducenteEsterno();
  const { mutate: reactivateConducente } = useReactivateConducenteEsterno();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'tutti' | 'attivi' | 'inattivi'>('tutti');
  const [conducenteToToggle, setConducenteToToggle] = useState<ConducenteEsterno | null>(null);

  // Debounced search
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Filter and search logic
  const filteredConducenti = useMemo(() => {
    let filtered = conducenti;

    // Apply status filter
    if (activeFilter === 'attivi') {
      filtered = filtered.filter(c => c.attivo);
    } else if (activeFilter === 'inattivi') {
      filtered = filtered.filter(c => !c.attivo);
    }

    // Apply search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        c =>
          c.nome_cognome.toLowerCase().includes(searchLower) ||
          (c.email && c.email.toLowerCase().includes(searchLower)) ||
          (c.telefono && c.telefono.includes(searchLower))
      );
    }

    return filtered;
  }, [conducenti, activeFilter, debouncedSearch]);

  // Counts for tabs
  const counts = useMemo(
    () => ({
      tutti: conducenti.length,
      attivi: conducenti.filter(c => c.attivo).length,
      inattivi: conducenti.filter(c => !c.attivo).length,
    }),
    [conducenti]
  );

  // Handlers
  const handleToggle = (conducente: ConducenteEsterno) => {
    setConducenteToToggle(conducente);
  };

  const confirmToggle = () => {
    if (!conducenteToToggle) return;

    if (conducenteToToggle.attivo) {
      deleteConducente(conducenteToToggle.id);
    } else {
      reactivateConducente(conducenteToToggle.id);
    }

    setConducenteToToggle(null);
  };

  const handleCall = (telefono: string) => {
    window.location.href = `tel:${telefono}`;
  };

  if (isLoading) {
    return <div className="text-center py-8">Caricamento conducenti esterni...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <ConducentiEsterniStats conducenti={conducenti} />

      {/* Mobile-First Layout */}
      <SmartSearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Cerca per nome, email, telefono..."
      />

      <QuickFilterTabs
        activeFilter={activeFilter}
        onChange={setActiveFilter}
        counts={counts}
      />

      {/* Conducenti List */}
      <div className="px-8 py-4 space-y-4 pb-24">
        {/* Mobile: Cards */}
        <div className="block lg:hidden space-y-4">
          {filteredConducenti.length === 0 ? (
            <div className="text-center py-16">
              <UserX className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                {searchTerm
                  ? 'Nessun conducente trovato'
                  : activeFilter === 'attivi'
                  ? 'Nessun conducente attivo'
                  : activeFilter === 'inattivi'
                  ? 'Nessun conducente inattivo'
                  : 'Nessun conducente registrato'}
              </p>
              {searchTerm && (
                <p className="text-sm text-muted-foreground mt-2">
                  Prova a modificare i criteri di ricerca
                </p>
              )}
            </div>
          ) : (
            filteredConducenti.map(conducente => (
              <ConducenteEsternoCardEnhanced
                key={conducente.id}
                conducente={conducente}
                onEdit={onEdit}
                onToggle={handleToggle}
                onCall={handleCall}
              />
            ))
          )}
        </div>

        {/* Desktop: Tabella esistente */}
        <div className="hidden lg:block">
          <ConducenteEsternoList
            conducenti={filteredConducenti}
            onEdit={onEdit}
            onAddConducente={onAddConducente}
            title={
              activeFilter === 'tutti'
                ? 'Tutti i Conducenti'
                : activeFilter === 'attivi'
                ? 'Conducenti Attivi'
                : 'Conducenti Inattivi'
            }
            description={
              activeFilter === 'tutti'
                ? 'Gestione completa dei conducenti esterni'
                : activeFilter === 'attivi'
                ? 'Conducenti disponibili per i servizi'
                : 'Conducenti non disponibili per i servizi'
            }
          />
        </div>
      </div>

      {/* FAB */}
      <FloatingActionButton onClick={onAddConducente} />

      {/* Sheet laterale per form */}
      <ConducenteEsternoSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        conducente={selectedConducente}
        mode={mode}
      />

      {/* Conferma Delete/Reactivate Dialog */}
      <AlertDialog open={!!conducenteToToggle} onOpenChange={() => setConducenteToToggle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {conducenteToToggle?.attivo ? 'Disattiva conducente' : 'Riattiva conducente'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler {conducenteToToggle?.attivo ? 'disattivare' : 'riattivare'}{' '}
              <strong>{conducenteToToggle?.nome_cognome}</strong>?
              {conducenteToToggle?.attivo && (
                <span className="block mt-2 text-amber-600 dark:text-amber-500">
                  Il conducente non sarà più disponibile per nuove assegnazioni.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggle}>
              {conducenteToToggle?.attivo ? 'Disattiva' : 'Riattiva'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}