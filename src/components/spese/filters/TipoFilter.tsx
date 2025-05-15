
import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TipoFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function TipoFilter({ value, onChange }: TipoFilterProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="tipo">Tipo</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="tipo">
          <SelectValue placeholder="Tutti i tipi" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Tutti i tipi</SelectItem>
          <SelectItem value="spesa">Spesa</SelectItem>
          <SelectItem value="incasso">Incasso</SelectItem>
          <SelectItem value="prelievo">Prelievo</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
