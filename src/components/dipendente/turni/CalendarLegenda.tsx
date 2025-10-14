import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function CalendarLegenda() {
  const legendItems = [
    { label: 'Turno Completo (8h)', color: 'bg-blue-500' },
    { label: 'Mezza Giornata', color: 'bg-yellow-500' },
    { label: 'Ore Specifiche', color: 'bg-green-500' },
    { label: 'Malattia', color: 'bg-red-500' },
    { label: 'Non Disponibile', color: 'bg-gray-400' },
    { label: 'Straordinario', color: 'bg-purple-500' },
  ];

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-sm mb-3">Legenda</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <Badge className={`${item.color} text-white px-2 py-0.5`}>
              {item.label.split(' ')[0]}
            </Badge>
            <span className="text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
