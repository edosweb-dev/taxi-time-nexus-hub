# Mobile-First Migration Guide

## Overview
This guide provides step-by-step instructions for migrating existing pages to the new mobile-first design system.

## Before You Start

### Prerequisites
- Familiarize yourself with the [Mobile-First Style Guide](./MOBILE_FIRST_STYLE_GUIDE.md)
- Install the new components (already added to project)
- Review the MobileTestingChecklist component

### Migration Strategy
1. **Audit existing page** for mobile-first violations
2. **Replace components** systematically (typography → spacing → layout)
3. **Test at mobile breakpoints** (375px, 768px)
4. **Validate with checklist** using MobileTestingChecklist component

## Step-by-Step Migration

### Step 1: Typography Migration

#### Replace Fixed Text Classes
```tsx
// BEFORE: Fixed typography
<h1 className="text-3xl font-bold">Dashboard</h1>
<p className="text-muted-foreground text-base">Welcome message</p>

// AFTER: Responsive Typography component
<Typography variant="h1">Dashboard</Typography>
<Typography variant="body" className="text-muted-foreground">Welcome message</Typography>
```

#### Common Replacements
```tsx
// Headers
text-3xl → <Typography variant="h1">
text-2xl → <Typography variant="h2">  
text-xl  → <Typography variant="h3">
text-lg  → <Typography variant="h4">

// Body text
text-base → <Typography variant="body">
text-sm   → <Typography variant="caption">
text-xs   → <Typography variant="small">
```

### Step 2: Spacing Migration

#### Replace Fixed Spacing
```tsx
// BEFORE: Fixed spacing
<div className="space-y-6">
  <div className="space-y-4">
    <div className="mb-2">

// AFTER: Responsive spacing constants  
<div className={RESPONSIVE_SPACING.SECTION_VERTICAL}>
  <div className={RESPONSIVE_SPACING.COMPONENT_VERTICAL}>
    <div className={RESPONSIVE_SPACING.ELEMENT_VERTICAL}>
```

#### Import Spacing Constants
```tsx
import { RESPONSIVE_SPACING } from '@/hooks/useResponsiveSpacing';
```

### Step 3: Grid System Migration

#### Replace Custom Grids
```tsx
// BEFORE: Custom grid classes
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {items.map(item => <Card key={item.id} />)}
</div>

// AFTER: ResponsiveGrid component
<ResponsiveGrid 
  cols={{ mobile: 1, tablet: 2, desktop: 3 }}
  gap="lg"
>
  {items.map(item => <Card key={item.id} />)}
</ResponsiveGrid>
```

### Step 4: Card Migration

#### Enhance Interactive Cards
```tsx
// BEFORE: Basic Card usage
<Card className="cursor-pointer" onClick={handleClick}>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content</p>
    <Button>Action</Button>
  </CardContent>
</Card>

// AFTER: MobileCard with touch optimization
<MobileCard interactive onClick={handleClick}>
  <div className={RESPONSIVE_SPACING.ELEMENT_VERTICAL}>
    <Typography variant="h3">Title</Typography>
    <Typography variant="caption">Description</Typography>
    <Typography variant="body">Content</Typography>
    <Button>Action</Button>
  </div>
</MobileCard>
```

### Step 5: Layout Structure Migration

#### Standardize Page Structure
```tsx
// BEFORE: Inconsistent layout
export default function SomePage() {
  return (
    <MainLayout>
      <div className="p-6 space-y-4"> {/* Conflicts with MainLayout */}
        <h1 className="text-2xl">Title</h1>
        <div className="grid grid-cols-2 gap-4">
          {/* Content */}
        </div>
      </div>
    </MainLayout>
  );
}

// AFTER: Standardized mobile-first structure
export default function SomePage() {
  return (
    <MainLayout>
      <div className={RESPONSIVE_SPACING.SECTION_VERTICAL}>
        {/* Header Section */}
        <div className={RESPONSIVE_SPACING.ELEMENT_VERTICAL}>
          <Typography variant="h1">Title</Typography>
          <Typography variant="body" className="text-muted-foreground">
            Description
          </Typography>
        </div>

        {/* Content Section */}
        <ResponsiveGrid cols={{ mobile: 1, desktop: 2 }} gap="lg">
          {/* Content */}
        </ResponsiveGrid>
      </div>
    </MainLayout>
  );
}
```

## Migration Examples

### Example 1: Dashboard Page

#### Before Migration
```tsx
export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Quick Action</CardTitle>
            </CardHeader>
            <CardContent>
              <Button>Action</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
```

#### After Migration
```tsx
export default function DashboardPage() {
  return (
    <MainLayout>
      <div className={RESPONSIVE_SPACING.SECTION_VERTICAL}>
        <div className={RESPONSIVE_SPACING.ELEMENT_VERTICAL}>
          <Typography variant="h1">Dashboard</Typography>
          <Typography variant="body" className="text-muted-foreground">
            Welcome back
          </Typography>
        </div>
        <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="lg">
          <MobileCard interactive>
            <div className={RESPONSIVE_SPACING.ELEMENT_VERTICAL}>
              <Typography variant="h3">Quick Action</Typography>
              <Button>Action</Button>
            </div>
          </MobileCard>
        </ResponsiveGrid>
      </div>
    </MainLayout>
  );
}
```

### Example 2: List Page

#### Before Migration  
```tsx
export default function ListPage() {
  return (
    <MainLayout>
      <div className="p-4 space-y-4">
        <h2 className="text-2xl">Items</h2>
        <div className="space-y-2">
          {items.map(item => (
            <Card key={item.id} className="p-4">
              <h3 className="text-lg font-medium">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
```

#### After Migration
```tsx
export default function ListPage() {
  return (
    <MainLayout>
      <div className={RESPONSIVE_SPACING.SECTION_VERTICAL}>
        <Typography variant="h2">Items</Typography>
        <div className={RESPONSIVE_SPACING.COMPONENT_VERTICAL}>
          {items.map(item => (
            <MobileCard key={item.id}>
              <div className={RESPONSIVE_SPACING.ELEMENT_VERTICAL}>
                <Typography variant="h3">{item.title}</Typography>
                <Typography variant="caption" className="text-muted-foreground">
                  {item.description}
                </Typography>
              </div>
            </MobileCard>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
```

## Migration Checklist

### Pre-Migration Audit
- [ ] Identify all hardcoded text classes (text-xl, text-2xl, etc.)
- [ ] List all hardcoded spacing classes (space-y-*, mb-*, etc.)
- [ ] Find all custom grid implementations
- [ ] Note any MainLayout padding overrides
- [ ] Check for touch targets smaller than 44px

### During Migration
- [ ] Replace typography with Typography component
- [ ] Update imports to include new components
- [ ] Replace spacing with RESPONSIVE_SPACING constants
- [ ] Convert grids to ResponsiveGrid component
- [ ] Enhance cards with MobileCard where appropriate
- [ ] Remove any padding overrides on MainLayout

### Post-Migration Validation
- [ ] Test at 375px viewport (no horizontal scroll)
- [ ] Test at 768px viewport (proper tablet layout)
- [ ] Test at 1024px+ viewport (proper desktop layout)
- [ ] Verify all touch targets ≥ 44px
- [ ] Run MobileTestingChecklist component
- [ ] Check typography scaling across breakpoints
- [ ] Validate spacing consistency

## Testing Tools

### Manual Testing Breakpoints
```tsx
// Test these viewport widths
const TEST_BREAKPOINTS = [
  375,  // Mobile (iPhone SE)
  390,  // Mobile (iPhone 12)
  768,  // Tablet boundary
  1024, // Desktop boundary
  1280  // Wide desktop
];
```

### Browser DevTools
1. Open Chrome DevTools (F12)
2. Click device emulation icon
3. Set custom viewport width
4. Test interaction and scrolling

### Using MobileTestingChecklist
```tsx
// Add to any page during development
import { MobileTestingChecklist } from '@/components/mobile-first/MobileTestingChecklist';

export default function TestPage() {
  return (
    <MainLayout>
      {/* Your page content */}
      
      {/* Testing component - remove before production */}
      {process.env.NODE_ENV === 'development' && (
        <MobileTestingChecklist />
      )}
    </MainLayout>
  );
}
```

## Common Migration Issues

### Issue 1: Text Overflow on Mobile
```tsx
// PROBLEM: Long text breaks layout
<Typography variant="h1" className="whitespace-nowrap">
  Very Long Page Title That Overflows

// SOLUTION: Let text wrap naturally  
<Typography variant="h1">
  Very Long Page Title That Overflows
```

### Issue 2: Touch Targets Too Small
```tsx
// PROBLEM: Icon buttons too small for touch
<Button size="icon" className="h-8 w-8">
  <Icon />
</Button>

// SOLUTION: Use TouchOptimizer or larger button
<TouchOptimizer minSize="md">
  <Button size="icon">
    <Icon />
  </Button>
</TouchOptimizer>
```

### Issue 3: Grid Breaks on Mobile
```tsx
// PROBLEM: Grid doesn't stack on mobile
<div className="grid grid-cols-3 gap-4">

// SOLUTION: Explicit mobile-first grid
<ResponsiveGrid cols={{ mobile: 1, desktop: 3 }} gap="md">
```

### Issue 4: Spacing Inconsistency
```tsx
// PROBLEM: Mixed spacing systems
<div className="space-y-2 md:space-y-6 mb-8">

// SOLUTION: Use consistent spacing constants
<div className={RESPONSIVE_SPACING.SECTION_VERTICAL}>
```

## Performance Considerations

### Bundle Size Impact
- New components add ~5KB to bundle (acceptable)
- Typography component eliminates duplicate CSS
- Responsive spacing reduces CSS duplication

### Runtime Performance
- useIsMobile hook uses optimized media query listener
- ResponsiveGrid uses CSS Grid (hardware accelerated)
- TouchOptimizer only adds classes on mobile

### Development Experience
- Better IntelliSense with TypeScript interfaces
- Consistent component APIs
- Easier debugging with semantic component names

## Rollback Strategy

If issues arise during migration:

1. **Keep old components**: Original components remain unchanged
2. **Gradual migration**: Migrate one page at a time
3. **Feature flags**: Use environment variables to toggle new system
4. **Quick revert**: Simply remove new imports and restore old JSX

```tsx
// Feature flag example
const USE_NEW_DESIGN_SYSTEM = process.env.VITE_NEW_DESIGN === 'true';

export default function SomePage() {
  if (USE_NEW_DESIGN_SYSTEM) {
    return <NewPageImplementation />;
  }
  return <OldPageImplementation />;
}
```