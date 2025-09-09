import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileHeaderProps {
  title: string;
  onMenuToggle?: () => void;
}

export function MobileHeader({ title, onMenuToggle }: MobileHeaderProps) {
  return (
    <div className="mobile-header">
      <h1 className="mobile-heading">{title}</h1>
      <Button
        variant="ghost"
        size="sm"
        onClick={onMenuToggle}
        className="text-primary-foreground hover:bg-primary-foreground/20"
      >
        <Menu className="w-5 h-5" />
      </Button>
    </div>
  );
}