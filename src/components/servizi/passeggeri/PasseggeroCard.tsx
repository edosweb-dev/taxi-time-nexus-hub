
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MinusCircle } from "lucide-react";
import { PasseggeroFields } from "./PasseggeroFields";

interface PasseggeroCardProps {
  index: number;
  onRemove: () => void;
}

export function PasseggeroCard({ index, onRemove }: PasseggeroCardProps) {
  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">
            Passeggero {index + 1}
          </CardTitle>
          <Button 
            type="button" 
            onClick={onRemove} 
            variant="ghost" 
            size="sm"
            className="text-destructive h-8 px-2"
          >
            <MinusCircle className="h-4 w-4 mr-1" />
            Rimuovi
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <PasseggeroFields index={index} />
      </CardContent>
    </Card>
  );
}
