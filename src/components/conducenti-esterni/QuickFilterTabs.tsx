interface QuickFilterTabsProps {
  activeFilter: 'tutti' | 'attivi' | 'inattivi';
  onChange: (filter: 'tutti' | 'attivi' | 'inattivi') => void;
  counts: {
    tutti: number;
    attivi: number;
    inattivi: number;
  };
}

export function QuickFilterTabs({ activeFilter, onChange, counts }: QuickFilterTabsProps) {
  return (
    <div className="px-8 py-4 bg-muted/30 border-b">
      <div className="flex gap-3 justify-center items-center flex-wrap">
        <button
          onClick={() => onChange('tutti')}
          className={`flex-shrink-0 h-12 px-6 rounded-xl font-semibold text-base transition-all active:scale-95 ${
            activeFilter === 'tutti'
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'bg-background text-foreground border-2 border-border hover:border-primary/50'
          }`}
        >
          Tutti
          <span className={`ml-2 px-2 py-0.5 rounded-full text-sm ${
            activeFilter === 'tutti' ? 'bg-primary-foreground/20' : 'bg-muted'
          }`}>
            {counts.tutti}
          </span>
        </button>
        
        <button
          onClick={() => onChange('attivi')}
          className={`flex-shrink-0 h-12 px-6 rounded-xl font-semibold text-base transition-all active:scale-95 ${
            activeFilter === 'attivi'
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'bg-background text-foreground border-2 border-border hover:border-primary/50'
          }`}
        >
          Attivi
          <span className={`ml-2 px-2 py-0.5 rounded-full text-sm ${
            activeFilter === 'attivi' ? 'bg-primary-foreground/20' : 'bg-muted'
          }`}>
            {counts.attivi}
          </span>
        </button>
        
        <button
          onClick={() => onChange('inattivi')}
          className={`flex-shrink-0 h-12 px-6 rounded-xl font-semibold text-base transition-all active:scale-95 ${
            activeFilter === 'inattivi'
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'bg-background text-foreground border-2 border-border hover:border-primary/50'
          }`}
        >
          Inattivi
          <span className={`ml-2 px-2 py-0.5 rounded-full text-sm ${
            activeFilter === 'inattivi' ? 'bg-primary-foreground/20' : 'bg-muted'
          }`}>
            {counts.inattivi}
          </span>
        </button>
      </div>
    </div>
  );
}
