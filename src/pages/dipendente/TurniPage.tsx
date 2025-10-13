import { DipendenteLayout } from "@/components/layouts/DipendenteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

export default function TurniPage() {
  return (
    <DipendenteLayout title="I Miei Turni">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">I Miei Turni</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
            <p className="text-muted-foreground">
              Gestisci i tuoi turni di lavoro.
            </p>
          </CardContent>
        </Card>
      </div>
    </DipendenteLayout>
  );
}
