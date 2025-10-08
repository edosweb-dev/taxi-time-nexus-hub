import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface MobileSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const MobileSelect = React.forwardRef<
  HTMLButtonElement,
  MobileSelectProps
>(({ value, onValueChange, placeholder, children, disabled, className }, ref) => {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        ref={ref}
        className={cn(
          "min-h-[44px]", // iOS touch guideline
          "active:scale-[0.98] transition-transform", // Feedback tattile
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {children}
      </SelectContent>
    </Select>
  );
});

MobileSelect.displayName = "MobileSelect";

export { SelectItem };
