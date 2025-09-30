export function MobileAziendaCardSkeleton() {
  return (
    <div className="mobile-card">
      <div className="space-y-3 animate-pulse">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-24" />
          </div>
        </div>
        
        {/* Info rows */}
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-2/3" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
        
        {/* Badges */}
        <div className="flex gap-2">
          <div className="h-6 bg-muted rounded-full w-20" />
          <div className="h-6 bg-muted rounded-full w-24" />
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t">
          <div className="h-10 bg-muted rounded flex-1" />
          <div className="h-10 bg-muted rounded w-10" />
        </div>
      </div>
    </div>
  );
}
