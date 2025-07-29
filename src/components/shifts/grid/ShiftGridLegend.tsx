import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export const shiftTypeColors = {
  'full_day': 'bg-blue-500 text-white',
  'half_day': 'bg-green-500 text-white', 
  'specific_hours': 'bg-orange-500 text-white',
  'sick_leave': 'bg-red-500 text-white',
  'unavailable': 'bg-gray-500 text-white'
};

export const shiftTypeLabels = {
  'full_day': 'Giornata Intera',
  'half_day': 'Mezza Giornata',
  'specific_hours': 'Orario Specifico',
  'sick_leave': 'Malattia',
  'unavailable': 'Non Disponibile'
};

export function ShiftGridLegend() {
  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Legenda:</span>
          {Object.entries(shiftTypeColors).map(([type, colorClass]) => (
            <Badge 
              key={type}
              variant="outline" 
              className={`${colorClass} border-none text-xs`}
            >
              {shiftTypeLabels[type as keyof typeof shiftTypeLabels]}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}