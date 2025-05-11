
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  message: string;
  showButton?: boolean;
  onCreateNew?: () => void;
}

export const EmptyState = ({ message, showButton = false, onCreateNew }: EmptyStateProps) => {
  return (
    <Card className="col-span-full">
      <CardContent className="pt-6 flex flex-col items-center justify-center h-32">
        <p className="text-muted-foreground text-center mb-4">
          {message}
        </p>
        {showButton && onCreateNew && (
          <Button onClick={onCreateNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crea il tuo primo servizio
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
