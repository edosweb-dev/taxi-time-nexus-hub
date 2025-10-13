import { DipendenteLayout } from "@/components/layouts/DipendenteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export default function SpesePage() {
  return (
    <DipendenteLayout title="Le Mie Spese">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Le Mie Spese</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <DollarSign className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
            <p className="text-muted-foreground">
              Registra le tue spese di lavoro.
            </p>
          </CardContent>
        </Card>
      </div>
    </DipendenteLayout>
  );
}
