import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Typography } from '@/components/ui/typography';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';
import { RESPONSIVE_SPACING } from '@/hooks/useResponsiveSpacing';
import { useIsMobile } from '@/hooks/use-mobile';

export interface TestingItem {
  id: string;
  category: 'typography' | 'spacing' | 'touch' | 'overflow' | 'navigation';
  description: string;
  required: boolean;
  checked: boolean;
}

const DEFAULT_CHECKLIST: TestingItem[] = [
  // Typography
  { id: 'typo-1', category: 'typography', description: 'Headings use Typography component with responsive variants', required: true, checked: false },
  { id: 'typo-2', category: 'typography', description: 'Text scales properly from 375px to desktop', required: true, checked: false },
  { id: 'typo-3', category: 'typography', description: 'No fixed text-xl, text-2xl classes in components', required: true, checked: false },
  
  // Spacing
  { id: 'space-1', category: 'spacing', description: 'Consistent spacing using RESPONSIVE_SPACING constants', required: true, checked: false },
  { id: 'space-2', category: 'spacing', description: 'No hardcoded space-y-* without responsive variants', required: true, checked: false },
  { id: 'space-3', category: 'spacing', description: 'MainLayout padding not overridden by components', required: true, checked: false },
  
  // Touch Targets
  { id: 'touch-1', category: 'touch', description: 'Interactive elements ≥ 44px touch area on mobile', required: true, checked: false },
  { id: 'touch-2', category: 'touch', description: 'Buttons have proper spacing between them (≥ 8px)', required: true, checked: false },
  { id: 'touch-3', category: 'touch', description: 'Forms optimized with TouchOptimizer component', required: false, checked: false },
  
  // Overflow
  { id: 'overflow-1', category: 'overflow', description: 'No horizontal scroll at 375px viewport', required: true, checked: false },
  { id: 'overflow-2', category: 'overflow', description: 'Grid system uses ResponsiveGrid with mobile-first approach', required: true, checked: false },
  { id: 'overflow-3', category: 'overflow', description: 'Content fits within MainLayout constraints', required: true, checked: false },
  
  // Navigation
  { id: 'nav-1', category: 'navigation', description: 'Sidebar collapses correctly on mobile', required: true, checked: false },
  { id: 'nav-2', category: 'navigation', description: 'Mobile navbar visible and functional', required: true, checked: false },
  { id: 'nav-3', category: 'navigation', description: 'No navigation overlap with content', required: true, checked: false }
];

export function MobileTestingChecklist() {
  const [checklist, setChecklist] = useState<TestingItem[]>(DEFAULT_CHECKLIST);
  const [currentPage, setCurrentPage] = useState('');
  const isMobile = useIsMobile();

  const updateItem = (id: string, checked: boolean) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, checked } : item
    ));
  };

  const resetChecklist = () => {
    setChecklist(prev => prev.map(item => ({ ...item, checked: false })));
  };

  const getProgress = () => {
    const total = checklist.length;
    const completed = checklist.filter(item => item.checked).length;
    return { total, completed, percentage: Math.round((completed / total) * 100) };
  };

  const getRequiredProgress = () => {
    const required = checklist.filter(item => item.required);
    const completed = required.filter(item => item.checked);
    return { 
      total: required.length, 
      completed: completed.length, 
      percentage: Math.round((completed.length / required.length) * 100) 
    };
  };

  const progress = getProgress();
  const requiredProgress = getRequiredProgress();

  const categorizeItems = () => {
    return checklist.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, TestingItem[]>);
  };

  const categoryLabels = {
    typography: 'Typography Responsive',
    spacing: 'Spacing Consistency', 
    touch: 'Touch Targets',
    overflow: 'Layout Overflow',
    navigation: 'Navigation'
  };

  const categorizedItems = categorizeItems();

  return (
    <div className={RESPONSIVE_SPACING.SECTION_VERTICAL}>
      <div className={RESPONSIVE_SPACING.ELEMENT_VERTICAL}>
        <Typography variant="h2">Mobile-First Testing Checklist</Typography>
        <Typography variant="body" className="text-muted-foreground">
          Validate your pages against mobile-first standards
        </Typography>
      </div>

      {/* Progress Overview */}
      <ResponsiveGrid cols={{ mobile: 1, desktop: 2 }} gap="md">
        <Card>
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
            <CardDescription>{progress.completed}/{progress.total} items completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{progress.percentage}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Required Items</CardTitle>
            <CardDescription>{requiredProgress.completed}/{requiredProgress.total} critical items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${requiredProgress.percentage === 100 ? 'text-green-600' : 'text-orange-600'}`}>
              {requiredProgress.percentage}%
            </div>
          </CardContent>
        </Card>
      </ResponsiveGrid>

      {/* Page Input */}
      <Card>
        <CardHeader>
          <CardTitle>Current Page</CardTitle>
          <CardDescription>Track testing progress for specific pages</CardDescription>
        </CardHeader>
        <CardContent>
          <input
            type="text"
            placeholder="e.g., ClientDashboardPage, ServiziPage"
            value={currentPage}
            onChange={(e) => setCurrentPage(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </CardContent>
      </Card>

      {/* Checklist by Category */}
      <div className={RESPONSIVE_SPACING.COMPONENT_VERTICAL}>
        {Object.entries(categorizedItems).map(([category, items]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{categoryLabels[category as keyof typeof categoryLabels]}</CardTitle>
              <CardDescription>
                {items.filter(item => item.checked).length}/{items.length} completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={RESPONSIVE_SPACING.TIGHT_VERTICAL}>
                {items.map(item => (
                  <div key={item.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={item.id}
                      checked={item.checked}
                      onCheckedChange={(checked) => updateItem(item.id, !!checked)}
                      className="mt-1"
                    />
                    <label htmlFor={item.id} className="flex-1 text-sm cursor-pointer">
                      {item.description}
                      {item.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={resetChecklist} variant="outline">
          Reset Checklist
        </Button>
        <Button 
          onClick={() => console.log('Testing results:', { currentPage, checklist, progress })}
        >
          Export Results
        </Button>
      </div>

      {/* Mobile-specific info */}
      {isMobile && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <Typography variant="caption" className="text-blue-700">
              📱 Testing on mobile device - Perfect for validating touch targets and responsive behavior!
            </Typography>
          </CardContent>
        </Card>
      )}
    </div>
  );
}