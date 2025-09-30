import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, Trash2, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileArrayFieldProps {
  label: string;
  icon: LucideIcon;
  items: string[];
  maxItems?: number;
  placeholder?: string;
  type?: 'email' | 'tel' | 'text';
  onChange: (items: string[]) => void;
  error?: string;
}

export function MobileArrayField({
  label,
  icon: Icon,
  items = [],
  maxItems = 5,
  placeholder = 'Inserisci valore',
  type = 'text',
  onChange,
  error,
}: MobileArrayFieldProps) {
  const addItem = () => {
    if (items.length < maxItems) {
      onChange([...items, '']);
    }
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange(newItems);
  };

  const getInputProps = () => {
    switch (type) {
      case 'email':
        return {
          type: 'email',
          inputMode: 'email' as const,
          autoComplete: 'email',
        };
      case 'tel':
        return {
          type: 'tel',
          inputMode: 'tel' as const,
          autoComplete: 'tel',
        };
      default:
        return {
          type: 'text',
        };
    }
  };

  return (
    <div className="space-y-3">
      {/* Label with counter */}
      <div className="flex items-center justify-between">
        <FormLabel className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {label}
        </FormLabel>
        <Badge variant="secondary" className="text-xs">
          {items.length}/{maxItems}
        </Badge>
      </div>

      {/* Items list */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <Card key={index} className="p-4">
            <div className="space-y-3">
              <Input
                {...getInputProps()}
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                placeholder={`${placeholder} ${index + 1}`}
                className="text-base" // Prevents iOS zoom
              />
              
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">
                  #{index + 1}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => removeItem(index)}
                  className="min-h-[44px] min-w-[44px]"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add button */}
      <Button
        type="button"
        variant="outline"
        onClick={addItem}
        disabled={items.length >= maxItems}
        className="w-full min-h-[44px]"
      >
        <Plus className="h-4 w-4 mr-2" />
        Aggiungi {label}
      </Button>

      {error && <FormMessage>{error}</FormMessage>}
    </div>
  );
}
