
import { Passeggero } from "@/lib/types/servizi";
import { PasseggeroEditCard } from "./PasseggeroEditCard";
import { PasseggeroViewCard } from "./PasseggeroViewCard";

interface PasseggeroCardProps {
  passeggero?: Passeggero;
  servizioPresa?: string;
  servizioDestinazione?: string;
  servizioOrario?: string;
  // Props for form usage
  index?: number;
  onRemove?: () => void;
}

export const PasseggeroCard = ({
  passeggero,
  servizioPresa,
  servizioDestinazione,
  servizioOrario,
  index,
  onRemove
}: PasseggeroCardProps) => {
  // If this is being used as a form field component
  if (typeof index === 'number' && onRemove) {
    return (
      <PasseggeroEditCard 
        index={index} 
        onRemove={onRemove} 
      />
    );
  }
  
  // Original view-only component
  return (
    <PasseggeroViewCard
      passeggero={passeggero!}
      servizioPresa={servizioPresa}
      servizioDestinazione={servizioDestinazione}
      servizioOrario={servizioOrario}
    />
  );
};
