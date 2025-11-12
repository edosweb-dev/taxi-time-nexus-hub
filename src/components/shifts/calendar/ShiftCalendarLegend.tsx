import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export const ShiftCalendarLegend = () => {
  const items = [
    { label: "Orario specifico", variant: "default" },
    { label: "Giornata intera", variant: "success" },
    { label: "Mezza giornata", variant: "secondary" },
    { label: "Turno extra", variant: "default", icon: <Sparkles className="h-3 w-3 text-purple-500" /> },
    { label: "Malattia", variant: "destructive" },
    { label: "Non disponibile", variant: "outline" },
  ];

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {items.map(({ label, variant, icon }) => (
        <div key={label} className="flex items-center gap-1">
          {icon && <span>{icon}</span>}
          <Badge variant={variant as any}>{label}</Badge>
        </div>
      ))}
    </div>
  );
};
