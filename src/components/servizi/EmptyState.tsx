
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

interface EmptyStateProps {
  message: string;
  showButton?: boolean;
  onCreateNew?: () => void;
}

export function EmptyState({ message, showButton = false, onCreateNew }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="pt-6 flex flex-col items-center justify-center py-10 text-center">
        <p className="mb-6 text-muted-foreground">{message}</p>
        {showButton && onCreateNew && (
          <Button onClick={onCreateNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crea nuovo servizio
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
