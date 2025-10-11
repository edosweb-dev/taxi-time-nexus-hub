import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export const shiftTypeColors = {
  'full_day': 'bg-blue-500 text-white',
  'half_day': 'bg-green-500 text-white',
  'unavailable': 'bg-gray-500 text-white',
  'extra': 'bg-purple-500 text-white'
};

export const shiftTypeLabels = {
  'full_day': 'Giornata Intera',
  'half_day': 'Mezza Giornata',
  'unavailable': 'Non Disponibile',
  'extra': 'Extra'
};

export function ShiftGridLegend() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">Legenda:</span>
      {Object.entries(shiftTypeColors).map(([type, colorClass]) => (
        <Badge 
          key={type}
          variant="outline" 
          className={`${colorClass} border-none text-[10px] px-1.5 py-0.5`}
        >
          {type === 'full_day' ? 'FD' : 
           type === 'half_day' ? 'M/P' :
           type === 'unavailable' ? 'ND' :
           type === 'extra' ? 'EX' : type}
        </Badge>
      ))}
    </div>
  );
}