
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ImportoFilterProps {
  minImporto: number | undefined;
  maxImporto: number | undefined;
  onMinChange: (value: number | undefined) => void;
  onMaxChange: (value: number | undefined) => void;
}

export function ImportoFilter({
  minImporto,
  maxImporto,
  onMinChange,
  onMaxChange,
}: ImportoFilterProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="min-importo">Importo min (€)</Label>
        <Input
          id="min-importo"
          type="number"
          placeholder="0.00"
          value={minImporto === undefined ? "" : minImporto}
          onChange={(e) => onMinChange(e.target.value ? Number(e.target.value) : undefined)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="max-importo">Importo max (€)</Label>
        <Input
          id="max-importo"
          type="number"
          placeholder="0.00"
          value={maxImporto === undefined ? "" : maxImporto}
          onChange={(e) => onMaxChange(e.target.value ? Number(e.target.value) : undefined)}
        />
      </div>
    </>
  );
}
