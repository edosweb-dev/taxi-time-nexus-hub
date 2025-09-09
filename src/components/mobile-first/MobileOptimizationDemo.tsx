import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export function MobileOptimizationDemo() {
  const isMobile = useIsMobile();

  return (
    <div className="w-full min-h-screen bg-background overflow-x-hidden">
      {/* Header mobile sticky */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-center">Demo Ottimizzazione Mobile</h1>
        <p className="text-sm text-center opacity-90 mt-1">
          Device: {isMobile ? 'Mobile' : 'Desktop'}
        </p>
      </div>

      <div className="p-4 space-y-6 pb-24">
        {/* Test Layout Responsive */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Test Layout Responsive</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-secondary p-3 rounded-lg">
                <div className="h-20 bg-primary/20 rounded mb-2"></div>
                <p className="text-sm">Card {i}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Test Touch Targets */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Test Touch Targets (44px min)</h2>
          <div className="flex flex-wrap gap-2">
            <Button size="sm">Piccolo</Button>
            <Button>Standard</Button>
            <Button size="lg">Grande</Button>
            <Badge variant="default" className="p-2">Badge</Badge>
          </div>
        </Card>

        {/* Test Form Elements */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Test Form Elements</h2>
          <div className="space-y-4">
            <Input 
              placeholder="Input ottimizzato per mobile (16px font per evitare zoom iOS)"
              className="w-full"
            />
            <Textarea 
              placeholder="Textarea responsive..."
              rows={3}
              className="w-full"
            />
            <Button className="w-full">Button Full Width Mobile</Button>
          </div>
        </Card>

        {/* Test Typography */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Test Typography Responsive</h2>
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl font-bold">H1 Responsive</h1>
            <h2 className="text-xl md:text-3xl font-semibold">H2 Responsive</h2>
            <h3 className="text-lg md:text-2xl font-medium">H3 Responsive</h3>
            <p className="text-base md:text-lg">Paragrafo responsive con testo che si adatta alla dimensione dello schermo.</p>
          </div>
        </Card>

        {/* Test Overflow Prevention */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Test Overflow Prevention</h2>
          <div className="bg-secondary p-3 rounded-lg overflow-hidden">
            <p className="text-sm break-words">
              Testo molto lungo che potrebbe causare overflow orizzontale se non gestito correttamente con CSS responsive e word-break appropriato.
            </p>
            <div className="mt-2 w-full bg-primary h-2 rounded"></div>
          </div>
        </Card>

        {/* Test Spacing Mobile */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Test Spacing Mobile</h2>
          <div className="space-y-2 sm:space-y-4 lg:space-y-6">
            <div className="bg-green-100 dark:bg-green-900/20 p-2 sm:p-4 lg:p-6 rounded">
              Spacing piccolo su mobile, grande su desktop
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/20 p-2 sm:p-4 lg:p-6 rounded">
              Spacing responsivo
            </div>
          </div>
        </Card>

        {/* Mobile-only elements */}
        <div className="block sm:hidden">
          <Card className="p-4 bg-green-50 dark:bg-green-950">
            <p className="text-green-800 dark:text-green-200 font-medium">
              ✅ Questo elemento è visibile solo su mobile
            </p>
          </Card>
        </div>

        {/* Desktop-only elements */}
        <div className="hidden sm:block">
          <Card className="p-4 bg-blue-50 dark:bg-blue-950">
            <p className="text-blue-800 dark:text-blue-200 font-medium">
              💻 Questo elemento è visibile solo su desktop
            </p>
          </Card>
        </div>
      </div>

      {/* Simulated bottom navigation space */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-primary/90 text-white p-3 flex justify-around z-50">
          <div className="text-center">
            <div className="w-6 h-6 bg-white/20 rounded mb-1 mx-auto"></div>
            <span className="text-xs">Nav 1</span>
          </div>
          <div className="text-center">
            <div className="w-6 h-6 bg-white/20 rounded mb-1 mx-auto"></div>
            <span className="text-xs">Nav 2</span>
          </div>
          <div className="text-center">
            <div className="w-6 h-6 bg-white/20 rounded mb-1 mx-auto"></div>
            <span className="text-xs">Nav 3</span>
          </div>
        </div>
      )}
    </div>
  );
}