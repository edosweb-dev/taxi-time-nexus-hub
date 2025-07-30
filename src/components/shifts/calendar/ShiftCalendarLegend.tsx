
import { Badge } from "@/components/ui/badge";

export const ShiftCalendarLegend = () => {
  const items = [
    { label: "Orario specifico", variant: "default" },
    { label: "Giornata intera", variant: "success" },
    { label: "Mezza giornata", variant: "secondary" },
    { label: "Malattia", variant: "destructive" },
    { label: "Non disponibile", variant: "outline" },
  ];

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {items.map(({ label, variant }) => (
        <div key={label} className="flex items-center gap-1">
          <Badge variant={variant as any}>{label}</Badge>
        </div>
      ))}
    </div>
  );
};
