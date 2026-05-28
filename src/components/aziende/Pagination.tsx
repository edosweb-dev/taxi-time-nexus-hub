import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const getVisiblePages = (): (number | string)[] => {
    const FORWARD = 3; // current + 2 successive
    const pages: (number | string)[] = [];

    // 3 pagine consecutive dal current verso avanti (clampato a totalPages)
    const end = Math.min(currentPage + FORWARD - 1, totalPages);
    for (let i = currentPage; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push('...', totalPages);
    } else if (end === totalPages - 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  const btnClass = "h-10 w-10 p-0 md:h-8 md:w-8 min-h-[40px] min-w-[40px] md:min-h-0 md:min-w-0";

  return (
    <div className="flex flex-col items-center gap-3 px-2 md:flex-row md:justify-between md:gap-0">
      <div className="text-sm text-muted-foreground text-center md:text-left">
        <span className="md:hidden">{startItem}-{endItem} di {totalItems}</span>
        <span className="hidden md:inline">Mostra {startItem} - {endItem} di {totalItems} aziende</span>
      </div>
      
      <div className="flex items-center space-x-1 md:space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`hidden md:inline-flex ${btnClass}`}
        >
          <ChevronsLeft className="h-5 w-5" strokeWidth={2.5} />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={btnClass}
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
        </Button>

        <div className="flex items-center space-x-1">
          {getVisiblePages().map((page, index) => (
            <Button
              key={index}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={btnClass}
            >
              {page}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={btnClass}
        >
          <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`hidden md:inline-flex ${btnClass}`}
        >
          <ChevronsRight className="h-5 w-5" strokeWidth={2.5} />
        </Button>
      </div>
    </div>
  );
}
