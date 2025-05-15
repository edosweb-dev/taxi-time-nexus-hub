
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CausaleFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function CausaleFilter({ value, onChange }: CausaleFilterProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="causale">Causale</Label>
      <Input
        id="causale"
        placeholder="Cerca per causale"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
