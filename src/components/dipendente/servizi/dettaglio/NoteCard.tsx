import { Card } from "@/components/ui/card";

interface NoteCardProps {
  note?: string;
}

export function NoteCard({ note }: NoteCardProps) {
  return (
    <Card className="p-4">
      <h3 className="font-semibold text-sm mb-3">NOTE</h3>
      {note ? (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap max-h-32 overflow-y-auto">
          {note}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground italic">Nessuna nota</p>
      )}
    </Card>
  );
}
