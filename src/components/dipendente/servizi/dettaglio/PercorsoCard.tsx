import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface PercorsoCardProps {
  indirizzoPresa: string;
  cittaPresa?: string;
  indirizzoDestinazione: string;
  cittaDestinazione?: string;
}

export function PercorsoCard({
  indirizzoPresa,
  cittaPresa,
  indirizzoDestinazione,
  cittaDestinazione
}: PercorsoCardProps) {
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(indirizzoPresa)}&destination=${encodeURIComponent(indirizzoDestinazione)}`;

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-sm mb-3">📍 PERCORSO</h3>
      <div className="space-y-4 text-sm">
        <div>
          <p className="text-muted-foreground mb-1">Presa:</p>
          <p className="font-medium">{indirizzoPresa}</p>
          {cittaPresa && (
            <p className="text-muted-foreground text-xs mt-0.5">Città: {cittaPresa}</p>
          )}
        </div>
        <div>
          <p className="text-muted-foreground mb-1">Destinazione:</p>
          <p className="font-medium">{indirizzoDestinazione}</p>
          {cittaDestinazione && (
            <p className="text-muted-foreground text-xs mt-0.5">Città: {cittaDestinazione}</p>
          )}
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.open(googleMapsUrl, '_blank', 'noopener,noreferrer')}
        >
          <MapPin className="h-4 w-4 mr-2" />
          Apri in Google Maps
        </Button>
      </div>
    </Card>
  );
}
