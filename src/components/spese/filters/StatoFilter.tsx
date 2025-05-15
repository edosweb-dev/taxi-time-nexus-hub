
import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatoFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function StatoFilter({ value, onChange }: StatoFilterProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="stato">Stato</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="stato">
          <SelectValue placeholder="Tutti gli stati" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Tutti gli stati</SelectItem>
          <SelectItem value="saldato">Saldato</SelectItem>
          <SelectItem value="pending">Da saldare</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
