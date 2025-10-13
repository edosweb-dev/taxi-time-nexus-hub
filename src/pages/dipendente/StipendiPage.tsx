import { DipendenteLayout } from "@/components/layouts/DipendenteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Euro } from "lucide-react";

export default function StipendiPage() {
  return (
    <DipendenteLayout title="I Miei Stipendi">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">I Miei Stipendi</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <Euro className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
            <p className="text-muted-foreground">
              Consulta lo storico dei tuoi stipendi.
            </p>
          </CardContent>
        </Card>
      </div>
    </DipendenteLayout>
  );
}
