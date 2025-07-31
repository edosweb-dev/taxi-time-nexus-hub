# Mobile-First Style Guide

## Overview
This guide outlines the mobile-first design system implemented for consistent, responsive, and touch-optimized user interfaces.

## Core Principles

### 1. Mobile-First Approach
- **Start with 375px**: Design for mobile first, enhance for larger screens
- **Progressive Enhancement**: Add desktop features as screen space allows
- **Touch-First**: All interactions optimized for touch input

### 2. Responsive Typography
```tsx
// ✅ CORRECT - Use Typography component
<Typography variant="h1">Page Title</Typography>
<Typography variant="body">Body text content</Typography>

// ❌ WRONG - Fixed sizing
<h1 className="text-3xl">Page Title</h1>
<p className="text-base">Body text</p>
```

### 3. Consistent Spacing
```tsx
// ✅ CORRECT - Use responsive spacing constants
<div className={RESPONSIVE_SPACING.SECTION_VERTICAL}>
  <div className={RESPONSIVE_SPACING.COMPONENT_VERTICAL}>
    <!-- Content -->
  </div>
</div>

// ❌ WRONG - Fixed spacing
<div className="space-y-6">
  <div className="space-y-4">
    <!-- Content -->
  </div>
</div>
```

## Component Usage Guidelines

### Typography Component

#### Variants Available
- `h1`: Page titles (largest, most prominent)
- `h2`: Section titles  
- `h3`: Subsection titles
- `h4`: Component titles
- `body`: Regular text content
- `caption`: Descriptive text
- `small`: Fine print, metadata

#### Best Practices
```tsx
// Page structure hierarchy
<Typography variant="h1">Dashboard</Typography>        // Page title
<Typography variant="h2">Recent Activity</Typography>  // Section title  
<Typography variant="h3">Service Request</Typography>  // Card title
<Typography variant="body">Description text</Typography> // Content
<Typography variant="caption">Last updated</Typography> // Metadata
```

### ResponsiveGrid Component

#### Grid Configurations
```tsx
// Dashboard cards
<ResponsiveGrid 
  cols={{ mobile: 1, tablet: 2, desktop: 3 }}
  gap="lg"
>
  {cards.map(card => <Card key={card.id} />)}
</ResponsiveGrid>

// List items  
<ResponsiveGrid
  cols={{ mobile: 1, desktop: 2 }}
  gap="md"
>
  {items.map(item => <ListItem key={item.id} />)}
</ResponsiveGrid>
```

#### Gap Sizes
- `sm`: 12px mobile, 16px desktop (tight layouts)
- `md`: 16px mobile, 24px desktop (default)
- `lg`: 24px mobile, 32px desktop (spacious)
- `xl`: 32px mobile, 48px desktop (very spacious)

### MobileCard Component

#### Interactive Cards
```tsx
<MobileCard 
  interactive={true}
  onClick={handleClick}
  className="border-primary/30"
>
  <Typography variant="h3">Card Title</Typography>
  <Typography variant="caption">Card description</Typography>
</MobileCard>
```

#### Card Spacing
- `tight`: Compact content (p-3 mobile, p-4 desktop)
- `normal`: Standard content (p-4 mobile, p-6 desktop) 
- `relaxed`: Spacious content (p-6 mobile, p-8 desktop)

### TouchOptimizer Component

#### When to Use
- Interactive elements that need guaranteed touch targets
- Custom buttons or clickable areas
- Form controls requiring precise touch input

```tsx
<TouchOptimizer minSize="md">
  <CustomButton onClick={handleClick}>
    Action
  </CustomButton>
</TouchOptimizer>
```

## Spacing System

### Responsive Spacing Constants

```tsx
import { RESPONSIVE_SPACING } from '@/hooks/useResponsiveSpacing';

// Between major page sections
RESPONSIVE_SPACING.SECTION_VERTICAL    // space-y-6 md:space-y-8
RESPONSIVE_SPACING.SECTION_HORIZONTAL  // space-x-4 md:space-x-6

// Between related components  
RESPONSIVE_SPACING.COMPONENT_VERTICAL   // space-y-4 md:space-y-6
RESPONSIVE_SPACING.COMPONENT_HORIZONTAL // space-x-3 md:space-x-4

// Between related elements
RESPONSIVE_SPACING.ELEMENT_VERTICAL     // space-y-3 md:space-y-4
RESPONSIVE_SPACING.ELEMENT_HORIZONTAL   // space-x-2 md:space-x-3

// For compact layouts
RESPONSIVE_SPACING.TIGHT_VERTICAL       // space-y-2 md:space-y-3
RESPONSIVE_SPACING.TIGHT_HORIZONTAL     // space-x-1 md:space-x-2
```

### Usage Guidelines

#### Page Layout
```tsx
<MainLayout>
  <div className={RESPONSIVE_SPACING.SECTION_VERTICAL}>
    {/* Header section */}
    <div className={RESPONSIVE_SPACING.ELEMENT_VERTICAL}>
      <Typography variant="h1">Page Title</Typography>
      <Typography variant="body">Page description</Typography>
    </div>
    
    {/* Main content */}
    <ResponsiveGrid cols={{ mobile: 1, desktop: 2 }}>
      {/* Grid items */}
    </ResponsiveGrid>
  </div>
</MainLayout>
```

#### Component Structure
```tsx
<MobileCard>
  <div className={RESPONSIVE_SPACING.ELEMENT_VERTICAL}>
    <Typography variant="h3">Card Title</Typography>
    <Typography variant="caption">Card subtitle</Typography>
    <Typography variant="body">Card content</Typography>
    <Button>Action</Button>
  </div>
</MobileCard>
```

## Layout Guidelines

### MainLayout Usage

#### Padding Modes
- `default`: Standard page padding (px-5 mobile, scales up)
- `minimal`: Reduced padding for dense content
- `full-width`: Minimal padding for full-width sections

```tsx
// Set padding mode via LayoutContext
const { setPaddingMode } = useLayout();

useEffect(() => {
  setPaddingMode('minimal'); // For dense data tables
  return () => setPaddingMode('default');
}, []);
```

#### Best Practices
- Never override MainLayout padding with custom classes
- Use ResponsiveContainer for content that needs width constraints
- Respect the mobile bottom padding (prevents navbar overlap)

### Touch Target Requirements

#### Minimum Sizes
- **Primary actions**: 48px minimum (lg TouchOptimizer)
- **Secondary actions**: 44px minimum (md TouchOptimizer)  
- **Tertiary actions**: 40px minimum (sm TouchOptimizer)

#### Spacing Requirements
- **Between touch targets**: Minimum 8px gap
- **Text links in paragraphs**: Minimum 44px touch area
- **Icon buttons**: Minimum 44px total area including padding

## Responsive Breakpoints

### Defined Breakpoints
```tsx
// Mobile first approach
mobile: "375px and up"    // useIsMobile() = true below 768px
tablet: "768px and up"    // md: prefix in Tailwind
desktop: "1024px and up"  // lg: prefix in Tailwind  
wide: "1280px and up"     // xl: prefix in Tailwind
```

### Media Query Usage
```tsx
// Conditional rendering based on screen size
const isMobile = useIsMobile();

return (
  <>
    {isMobile ? (
      <MobileOptimizedComponent />
    ) : (
      <DesktopOptimizedComponent />
    )}
  </>
);
```

## Common Patterns

### Dashboard Pages
```tsx
export default function DashboardPage() {
  return (
    <MainLayout>
      <div className={RESPONSIVE_SPACING.SECTION_VERTICAL}>
        {/* Header */}
        <div className={RESPONSIVE_SPACING.ELEMENT_VERTICAL}>
          <Typography variant="h1">Dashboard</Typography>
          <Typography variant="body" className="text-muted-foreground">
            Welcome message
          </Typography>
        </div>
        
        {/* Actions Grid */}
        <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }}>
          {actions.map(action => (
            <MobileCard key={action.id} interactive>
              <div className={RESPONSIVE_SPACING.ELEMENT_VERTICAL}>
                <Typography variant="h3">{action.title}</Typography>
                <Typography variant="caption">{action.description}</Typography>
                <Button onClick={action.handler}>
                  {action.label}
                </Button>
              </div>
            </MobileCard>
          ))}
        </ResponsiveGrid>
      </div>
    </MainLayout>
  );
}
```

### List Pages
```tsx
export default function ListPage() {
  return (
    <MainLayout>
      <div className={RESPONSIVE_SPACING.SECTION_VERTICAL}>
        {/* Search/Filters */}
        <div className={RESPONSIVE_SPACING.COMPONENT_VERTICAL}>
          <Typography variant="h1">Items</Typography>
          <SearchComponent />
        </div>
        
        {/* List Content */}
        <div className={RESPONSIVE_SPACING.COMPONENT_VERTICAL}>
          {items.map(item => (
            <MobileCard key={item.id} interactive>
              <ItemContent item={item} />
            </MobileCard>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
```

## Anti-Patterns to Avoid

### Typography
```tsx
// ❌ NEVER - Fixed text sizes
<h1 className="text-3xl font-bold">Title</h1>
<p className="text-base">Content</p>

// ❌ NEVER - Conditional text sizing without system
{isMobile ? "text-lg" : "text-2xl"}
```

### Spacing  
```tsx
// ❌ NEVER - Fixed spacing without responsive variants
<div className="space-y-4">
<div className="mb-6">

// ❌ NEVER - Overriding MainLayout padding
<MainLayout>
  <div className="px-8"> {/* Conflicts with MainLayout */}
```

### Layout
```tsx
// ❌ NEVER - Fixed grid without mobile consideration
<div className="grid grid-cols-3 gap-6">

// ❌ NEVER - Touch targets too small
<button className="p-1"> {/* Less than 44px */}
```

## Testing Checklist

Use the `MobileTestingChecklist` component to validate pages:

```tsx
import { MobileTestingChecklist } from '@/components/mobile-first/MobileTestingChecklist';

// Add to development pages for testing
<MobileTestingChecklist />
```

### Manual Testing
1. **375px viewport**: Ensure no horizontal scroll
2. **Touch targets**: Verify all interactive elements ≥ 44px
3. **Typography scaling**: Check text readability across breakpoints  
4. **Spacing consistency**: Verify visual hierarchy and breathing room
5. **Navigation**: Test sidebar collapse and mobile navbar functionality