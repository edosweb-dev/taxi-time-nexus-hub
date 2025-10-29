import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Circle, AlertCircle, Clock, User, ArrowRight } from 'lucide-react';
import { 
  hasAllRequiredFields, 
  hasDriverAssigned, 
  calculateServizioStato,
  getMissingFields,
  formatStatoLabel,
  getStatoBadgeVariant,
  type BadgeVariant
} from '@/utils/servizioValidation';
import type { Servizio } from '@/lib/types/servizi';
import { cn } from '@/lib/utils';

interface ServizioFormProgressProps {
  servizio: Partial<Servizio>;
  className?: string;
}

/**
 * Componente che mostra il progresso di compilazione di un servizio.
 * 
 * Visualizza:
 * - Stato corrente e stato futuro dopo il salvataggio
 * - Checklist dei requisiti (campi obbligatori + conducente)
 * - Messaggi informativi contestuali
 * - Progress bar del completamento
 */
export function ServizioFormProgress({ servizio, className }: ServizioFormProgressProps) {
  const hasRequired = hasAllRequiredFields(servizio);
  const hasDriver = hasDriverAssigned(servizio);
  const missingFields = getMissingFields(servizio);
  const currentStato = servizio.stato || 'bozza';
  const futureStato = calculateServizioStato({ ...servizio, stato: currentStato });
  const statoWillChange = currentStato === 'bozza' && currentStato !== futureStato;

  // Calcolo percentuale completamento
  const completionPercentage = (() => {
    if (!hasRequired) {
      // Conta campi compilati vs totali per una stima
      const totalRequired = 5; // campi base obbligatori
      const completed = totalRequired - missingFields.length;
      return Math.max(0, (completed / totalRequired) * 60); // max 60% senza tutti i campi
    }
    if (hasRequired && !hasDriver) return 75;
    if (hasRequired && hasDriver) return 100;
    return 0;
  })();

  return (
    <div className={cn("p-4 bg-muted/50 rounded-lg border space-y-4", className)}>
      {/* Header con stato */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-sm">Stato del Servizio</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStatoBadgeVariant(currentStato)}>
            {formatStatoLabel(currentStato)}
          </Badge>
          {statoWillChange && (
            <>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <Badge variant={getStatoBadgeVariant(futureStato)}>
                {formatStatoLabel(futureStato)}
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* Checklist requisiti */}
      <div className="space-y-3">
        {/* Campi obbligatori */}
        <div className="flex items-start gap-2">
          {hasRequired ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1">
            <p className={cn(
              "text-sm font-medium",
              hasRequired ? "text-green-600" : "text-muted-foreground"
            )}>
              Campi obbligatori completati
            </p>
            {!hasRequired && missingFields.length > 0 && (
              <p className="text-xs text-destructive mt-1">
                Mancanti: {missingFields.join(', ')}
              </p>
            )}
            {hasRequired && (
              <p className="text-xs text-muted-foreground mt-1">
                Tutti i campi base sono compilati
              </p>
            )}
          </div>
        </div>

        {/* Conducente assegnato */}
        <div className="flex items-start gap-2">
          {hasDriver ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <User className="h-3 w-3" />
              <p className={cn(
                "text-sm font-medium",
                hasDriver ? "text-green-600" : "text-muted-foreground"
              )}>
                Conducente assegnato
              </p>
            </div>
            {!hasDriver && (
              <p className="text-xs text-muted-foreground mt-1">
                Il servizio può essere salvato e assegnato successivamente
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Alert informativo contestuale */}
      {currentStato === 'bozza' && !hasRequired && (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
            Compila tutti i campi obbligatori per poter procedere con l'assegnazione
          </AlertDescription>
        </Alert>
      )}

      {currentStato === 'bozza' && hasRequired && !hasDriver && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
            Salvando, il servizio passerà a "Da Assegnare" e potrà essere assegnato a un conducente
          </AlertDescription>
        </Alert>
      )}

      {currentStato === 'bozza' && hasRequired && hasDriver && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-sm text-green-800 dark:text-green-200">
            Salvando, il servizio sarà automaticamente assegnato al conducente selezionato
          </AlertDescription>
        </Alert>
      )}

      {currentStato !== 'bozza' && (
        <Alert className="border-muted bg-muted/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm text-muted-foreground">
            Lo stato "{formatStatoLabel(currentStato)}" è fisso e non cambierà automaticamente
          </AlertDescription>
        </Alert>
      )}

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Completamento</span>
          <span className={cn(
            "font-medium",
            completionPercentage === 100 ? "text-green-600" : "text-muted-foreground"
          )}>
            {Math.round(completionPercentage)}%
          </span>
        </div>
        <Progress 
          value={completionPercentage} 
          className={cn(
            "h-2",
            completionPercentage === 100 && "bg-green-100 dark:bg-green-950"
          )}
        />
      </div>
    </div>
  );
}

/**
 * Versione compatta del componente per uso in card/liste.
 * Mostra solo badge stato + progress bar.
 */
export function ServizioFormProgressCompact({ servizio, className }: ServizioFormProgressProps) {
  const hasRequired = hasAllRequiredFields(servizio);
  const hasDriver = hasDriverAssigned(servizio);
  const currentStato = servizio.stato || 'bozza';
  
  const completionPercentage = (() => {
    if (!hasRequired) return 30;
    if (hasRequired && !hasDriver) return 75;
    if (hasRequired && hasDriver) return 100;
    return 0;
  })();

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Badge variant={getStatoBadgeVariant(currentStato)} className="text-xs">
        {formatStatoLabel(currentStato)}
      </Badge>
      <div className="flex-1 space-y-1">
        <Progress value={completionPercentage} className="h-1.5" />
      </div>
      <span className="text-xs text-muted-foreground tabular-nums">
        {Math.round(completionPercentage)}%
      </span>
    </div>
  );
}
