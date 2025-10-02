import { Search, X } from 'lucide-react';

interface SmartSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SmartSearchBar({ value, onChange, placeholder = "Cerca conducenti..." }: SmartSearchBarProps) {
  return (
    <div className="sticky top-0 z-10 bg-background border-b px-8 py-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input 
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-[52px] pl-12 pr-12 text-base rounded-xl border-2 border-input bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
          placeholder={placeholder}
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
            aria-label="Cancella ricerca"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}
