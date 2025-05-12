
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { PasseggeroBasicInfoForm } from "./PasseggeroBasicInfoForm";

interface PasseggeroEditCardProps {
  index: number;
  onRemove: () => void;
}

export const PasseggeroEditCard = ({ index, onRemove }: PasseggeroEditCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-medium">Passeggero {index + 1}</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRemove}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Rimuovi</span>
          </Button>
        </div>
        
        <PasseggeroBasicInfoForm index={index} />
      </CardContent>
    </Card>
  );
};
