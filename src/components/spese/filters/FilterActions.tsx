
import React from "react";
import { Button } from "@/components/ui/button";
import { FilterIcon } from "lucide-react";

interface FilterActionsProps {
  onReset: () => void;
  onApply: () => void;
}

export function FilterActions({ onReset, onApply }: FilterActionsProps) {
  return (
    <div className="flex justify-end mt-6 space-x-2">
      <Button variant="outline" onClick={onReset}>
        Resetta
      </Button>
      <Button onClick={onApply}>
        <FilterIcon className="mr-2 h-4 w-4" />
        Applica Filtri
      </Button>
    </div>
  );
}
