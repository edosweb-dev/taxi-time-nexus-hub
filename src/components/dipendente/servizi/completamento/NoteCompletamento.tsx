import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface NoteCompletamentoProps {
  value: string;
  onChange: (value: string) => void;
}

const MAX_LENGTH = 500;

export function NoteCompletamento({ value, onChange }: NoteCompletamentoProps) {
  const remaining = MAX_LENGTH - value.length;

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">NOTE COMPLETAMENTO</h3>
        
        <Textarea
          value={value}
          onChange={(e) => {
            if (e.target.value.length <= MAX_LENGTH) {
              onChange(e.target.value);
            }
          }}
          placeholder="Note aggiuntive sul completamento (opzionale)"
          className="min-h-[100px] resize-y"
        />
        
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Opzionale</span>
          <span className={remaining < 50 ? 'text-warning' : ''}>
            {value.length}/{MAX_LENGTH} caratteri
          </span>
        </div>
      </div>
    </Card>
  );
}
