import { useEffect, useRef } from "react";
import { Loader2, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ServizioCard } from "./ServizioCard";
import { ServiziEmptyState } from "./ServiziEmptyState";
import { ServizioWithRelations } from "@/lib/api/dipendente/servizi";
import { groupByDate } from "@/lib/utils/dateGrouping";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ServiziElencoViewProps {
  servizi: ServizioWithRelations[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onViewDetails: (id: string) => void;
  onCompleta?: (id: string) => void;
  onResetFilters: () => void;
  onCardClick?: (id: string) => void;
}

export const ServiziElencoView = ({
  servizi,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  onViewDetails,
  onCompleta,
  onResetFilters,
  onCardClick
}: ServiziElencoViewProps) => {
  const observerTarget = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  // Show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-32 w-full" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (servizi.length === 0) {
    return (
      <ServiziEmptyState 
        type="no-results" 
        onReset={onResetFilters}
      />
    );
  }

  // Group servizi by date
  const groupedServizi = groupByDate(servizi);

  return (
    <div className="relative">
      <div className="space-y-6 p-4">
        {groupedServizi.map((group) => (
          <div key={group.date} className="space-y-3">
            {/* Sticky Date Header */}
            <div className="sticky top-12 z-10 bg-muted/95 backdrop-blur-sm py-2 px-4 rounded-lg border">
              <h3 className="font-semibold text-sm uppercase tracking-wide">
                {group.label}
              </h3>
            </div>

            {/* Servizi Cards */}
            <div className="space-y-3">
              {group.items.map((servizio) => (
                <ServizioCard
                  key={servizio.id}
                  servizio={servizio}
                  onViewDetails={onViewDetails}
                  onCompleta={onCompleta}
                  onClick={onCardClick ? () => onCardClick(servizio.id) : undefined}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Intersection Observer Target */}
        <div ref={observerTarget} className="h-20 flex items-center justify-center">
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Caricamento...</span>
            </div>
          )}
        </div>
      </div>

      {/* Scroll to Top Button */}
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "fixed bottom-24 right-6 rounded-full shadow-lg transition-all duration-300 z-20",
          showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        )}
        onClick={scrollToTop}
      >
        <ChevronUp className="h-5 w-5" />
      </Button>
    </div>
  );
};
