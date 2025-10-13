import { DipendenteLayout } from "@/components/layouts/DipendenteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function ServiziAssegnatiPage() {
  return (
    <DipendenteLayout title="Servizi Assegnati">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Servizi Assegnati</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
            <p className="text-muted-foreground">
              Qui vedrai tutti i servizi che ti sono stati assegnati.
            </p>
          </CardContent>
        </Card>
      </div>
    </DipendenteLayout>
  );
}
