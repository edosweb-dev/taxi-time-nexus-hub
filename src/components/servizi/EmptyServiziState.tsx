import { Inbox, Filter, AlertTriangle, Plus, ArrowRight, RefreshCw, Calendar, Hash } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export interface StatusCount {
  key: string;
  label: string;
  count: number;
}

interface EmptyServiziStateProps {
  activeTab: string;
  activeTabLabel: string;
  statusCounts: StatusCount[];
  dataFiltro?: Date;
  idFiltro?: string;
  isError?: boolean;
  errorMessage?: string;
  onGoToTab: (tab: string) => void;
  onClearFilters: () => void;
  onCreateNew: () => void;
  onRetry: () => void;
}

export function EmptyServiziState({
  activeTab,
  activeTabLabel,
  statusCounts,
  dataFiltro,
  idFiltro,
  isError,
  errorMessage,
  onGoToTab,
  onClearFilters,
  onCreateNew,
  onRetry,
}: EmptyServiziStateProps) {
  const navigate = useNavigate();

  // CASO D — Errore
  if (isError) {
    return (
      <Card className="w-full p-8 text-center">
        <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <h3 className="text-lg font-semibold">Impossibile caricare i servizi</h3>
          {errorMessage && (
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
          )}
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <Button onClick={onRetry} variant="default">
              <RefreshCw className="h-4 w-4 mr-2" />
              Riprova
            </Button>
            <Button onClick={() => navigate('/assistenza')} variant="outline">
              Vai in Assistenza
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Se il problema persiste, vai in /assistenza.
          </p>
        </div>
      </Card>
    );
  }

  const hasActiveFilters = !!dataFiltro || !!(idFiltro && idFiltro.trim());
  const otherTabsWithItems = statusCounts.filter(s => s.key !== activeTab && s.count > 0);
  const totalItems = statusCounts.reduce((sum, s) => sum + s.count, 0);

  // CASO C — Filtri attivi
  if (hasActiveFilters) {
    return (
      <Card className="w-full p-8 text-center">
        <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
          <Filter className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Nessun servizio corrisponde ai filtri</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {dataFiltro && (
              <Badge variant="secondary" className="gap-1">
                <Calendar className="h-3 w-3" />
                Data: {format(dataFiltro, 'dd/MM/yyyy', { locale: it })}
              </Badge>
            )}
            {idFiltro && idFiltro.trim() && (
              <Badge variant="secondary" className="gap-1">
                <Hash className="h-3 w-3" />
                ID: {idFiltro.trim()}
              </Badge>
            )}
          </div>
          <Button onClick={onClearFilters} variant="default" className="mt-2">
            Rimuovi filtri
          </Button>
        </div>
      </Card>
    );
  }

  // CASO B — Tutti i tab vuoti
  if (totalItems === 0) {
    return (
      <Card className="w-full p-8 text-center">
        <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
          <Inbox className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Nessun servizio inserito</h3>
          <p className="text-sm text-muted-foreground">
            Crea il tuo primo servizio per iniziare.
          </p>
          <Button onClick={onCreateNew} variant="default" className="mt-2">
            <Plus className="h-4 w-4 mr-2" />
            Nuovo servizio
          </Button>
        </div>
      </Card>
    );
  }

  // CASO A — Tab corrente vuoto, altri tab hanno servizi
  return (
    <Card className="w-full p-8 text-center">
      <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
        <Inbox className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold">
          Nessun servizio in "{activeTabLabel}"
        </h3>
        {otherTabsWithItems.length > 0 && (
          <>
            <p className="text-sm text-muted-foreground">Hai però:</p>
            <div className="w-full space-y-2 mt-2">
              {otherTabsWithItems.map(tab => (
                <div
                  key={tab.key}
                  className="flex items-center justify-between gap-3 p-3 rounded-md border bg-muted/30"
                >
                  <span className="text-sm">
                    <span className="font-semibold">{tab.count}</span> in "{tab.label}"
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onGoToTab(tab.key)}
                    className="gap-1"
                  >
                    Vai
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
