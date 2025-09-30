interface MobileDetailSkeletonProps {
  tab?: 'info' | 'referenti' | 'passeggeri' | 'config';
}

export function MobileDetailSkeleton({ tab = 'info' }: MobileDetailSkeletonProps) {
  if (tab === 'info') {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="mobile-card animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-3" />
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tab === 'referenti') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-muted rounded w-24 animate-pulse" />
          <div className="h-10 bg-muted rounded w-28 animate-pulse" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="mobile-card animate-pulse">
            <div className="flex items-start gap-3 mb-3">
              <div className="h-10 w-10 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
            <div className="flex gap-2 pt-3 border-t">
              <div className="h-10 bg-muted rounded flex-1" />
              <div className="h-10 bg-muted rounded w-10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tab === 'passeggeri') {
    return (
      <div className="space-y-3">
        <div className="mb-4">
          <div className="h-6 bg-muted rounded w-32 mb-2 animate-pulse" />
          <div className="h-3 bg-muted rounded w-24 animate-pulse" />
        </div>
        <div className="flex gap-2 pb-3 mb-4 border-b">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded-full w-24 animate-pulse" />
          ))}
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="mobile-card animate-pulse">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tab === 'config') {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="mobile-card animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-11 w-11 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
              <div className="h-6 bg-muted rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
