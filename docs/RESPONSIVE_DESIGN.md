# VedaMilan Responsive Design Guide

## 1. Current State Assessment

VedaMilan uses **Tailwind CSS v4** with a mobile-first, utility-first architecture. The codebase already demonstrates strong responsive patterns:

- **Sidebar**: Hidden on mobile (`md:flex`), collapsible on tablet/desktop
- **Mobile bottom nav**: Visible only on mobile (`md:hidden`), replaced by sidebar on desktop
- **Grid layouts**: Progressive enhancement from 1 → 2 → 3 columns
- **Typography**: Scales via `sm:text-*`, `md:text-*`, `lg:text-*` utilities
- **Spacing**: Adjusts via `sm:space-y-*`, `sm:p-*`, `sm:gap-*` patterns
- **Charts/Scroll areas**: Use `max-h-[min(48dvh,20rem)]` with responsive overrides per breakpoint

### Existing Breakpoints (Tailwind Defaults)

| Prefix | Min-width | Typical Use                  |
| ------ | --------- | ---------------------------- |
| `sm`   | 640px     | Large phones / small tablets |
| `md`   | 768px     | Tablets                      |
| `lg`   | 1024px    | Laptops / small desktops     |
| `xl`   | 1280px    | Desktops                     |
| `2xl`  | 1536px    | Large desktops               |

## 2. Breakpoint Strategy

### Core Principle

**Mobile-first**: Every component defaults to the smallest screen experience, then layers on complexity at each breakpoint.

### Recommended Breakpoint Usage

| Breakpoint     | Layout Change                     | Navigation                | Grid Columns | Typography                    |
| -------------- | --------------------------------- | ------------------------- | ------------ | ----------------------------- |
| Base (< 640px) | Stacked, single column            | Bottom nav + hamburger    | 1 col        | `text-xs` / `text-sm`         |
| `sm` (640px+)  | 2-column cards where appropriate  | Bottom nav (larger touch) | 2 cols       | `sm:text-sm` / `sm:text-base` |
| `md` (768px+)  | Sidebar appears, 3-column layouts | Sidebar collapses         | 3 cols       | `md:text-base` / `md:text-lg` |
| `lg` (1024px+) | Sidebar expands, sticky panels    | Full sidebar              | 3-4 cols     | `lg:text-lg` / `lg:text-xl`   |
| `xl` (1280px+) | Max-width containers, wide tables | Full sidebar              | 4+ cols      | `xl:text-xl` / `xl:text-2xl`  |

## 3. Layout Patterns

### 3.1 Fluid Grid System

Use `grid` with responsive column counts:

```tsx
{/* Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols */}
<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
```

For asymmetric layouts (like Calendar page):

```tsx
{
  /* Main content spans 2 cols on desktop, sidebar takes 1 */
}
<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
  <main className="lg:col-span-2">...</main>
  <aside className="lg:col-span-1">...</aside>
</div>;
```

### 3.2 Container Strategy

```tsx
{
  /* Full-bleed on mobile, padded on tablet, max-width on desktop */
}
<div className="min-w-0 space-y-5 sm:space-y-6 lg:space-y-8">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{/* Content */}</div>
</div>;
```

### 3.3 Overflow Prevention

Always use `min-w-0` on flex/grid children to prevent text overflow:

```tsx
<div className="flex min-w-0">
  <p className="truncate">Long text that would otherwise overflow</p>
</div>
```

For horizontal scrolling chips:

```tsx
<div className="scrollbar-hidden -mx-0.5 flex gap-1.5 overflow-x-auto px-0.5">
  {/* Chip buttons */}
</div>
```

## 4. Typography Scaling

### Scale Map

| Element       | Mobile        | Tablet         | Desktop        |
| ------------- | ------------- | -------------- | -------------- |
| Page title    | `text-2xl`    | `sm:text-3xl`  | `lg:text-4xl`  |
| Section title | `text-xl`     | `sm:text-2xl`  | `md:text-3xl`  |
| Card title    | `text-lg`     | `sm:text-xl`   | `md:text-2xl`  |
| Body          | `text-sm`     | `sm:text-base` | `md:text-base` |
| Small/caption | `text-xs`     | `sm:text-sm`   | `md:text-sm`   |
| Tiny labels   | `text-[10px]` | `sm:text-xs`   | `md:text-xs`   |

### Font Stack

```css
:root {
  --font-body: "Plus Jakarta Sans", system-ui, sans-serif;
  --font-display: "Cormorant Garamond", Georgia, serif;
}
```

Use `font-display` for ceremonial/headings, `font-body` (default) for UI.

## 5. Touch Targets

### Minimum Sizes

| Element      | Mobile              | Desktop                  |
| ------------ | ------------------- | ------------------------ |
| Buttons      | `h-11` (44px)       | `h-10` (40px) acceptable |
| Icon buttons | `h-10 w-10`         | `h-9 w-9`                |
| Tab triggers | `min-h-11`          | `min-h-10`               |
| Nav items    | `h-14` (bottom nav) | `h-auto`                 |
| Form inputs  | `h-11`              | `h-10`                   |

### Spacing Between Touch Targets

```tsx
{/* Minimum 8px gap on mobile, 12px on tablet+ */}
<div className="flex gap-2 sm:gap-3">
```

## 6. Component-Specific Guidelines

### 6.1 PageHeader

```tsx
<PageHeader
  className="mb-5 sm:mb-6 md:mb-8"
  title="Page Title"
  description="Description text"
  actions={
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
      {/* Buttons stack on mobile, row on tablet+ */}
    </div>
  }
/>
```

### 6.2 Buttons

```tsx
{
  /* Full width on mobile, auto on desktop */
}
<Button className="w-full sm:w-auto">Action</Button>;
```

### 6.3 Cards

```tsx
{/* Padding scales with screen size */}
<GlassCard className="p-4 sm:p-5 lg:p-6">
```

### 6.4 Tabs

```tsx
{/* 2 cols on mobile, 4 on desktop */}
<TabsList className="grid grid-cols-2 md:grid-cols-4">
```

### 6.5 Tables

```tsx
{
  /* Horizontal scroll on mobile, static on desktop */
}
<div className="-mx-4 overflow-x-auto sm:mx-0">
  <table className="w-full min-w-[600px]">...</table>
</div>;
```

### 6.6 Charts

```tsx
{
  /* Responsive container with aspect ratio */
}
<div className="min-h-[300px] w-full sm:min-h-[400px] lg:min-h-[500px]">
  <Chart />
</div>;
```

## 7. Navigation Patterns

### 7.1 Mobile Bottom Nav

- Visible only on mobile (`md:hidden`)
- 4 primary actions + "More" overflow
- Uses `env(safe-area-inset-bottom)` for notched devices
- Active state: gold dot indicator + icon highlight

### 7.2 Sidebar (Tablet+)

- Hidden on mobile (`md:flex`)
- Collapsible: collapsed state `w-[4.5rem]`, expanded `w-[14rem] lg:w-[15.75rem]`
- Tablet default: collapsed (`max-width: 1023px`)
- Desktop default: expanded
- Uses `backdrop-blur` for glass effect

### 7.3 Mode Switcher

- Always visible in sidebar header
- Compact pills on mobile, full labels on desktop

## 8. Performance Optimization

### 8.1 Image Optimization

```tsx
{
  /* Next.js Image with responsive sizes */
}
<Image
  src={url}
  alt="Description"
  width={400}
  height={300}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  className="h-auto w-full"
/>;
```

### 8.2 Code Splitting

```tsx
{
  /* Lazy load heavy components */
}
const HeavyChart = dynamic(() => import("@/components/heavy-chart"), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});
```

### 8.3 Animation Performance

- Use `transform` and `opacity` only for animations
- Respect `prefers-reduced-motion`
- Use `will-change` sparingly

```tsx
const reduceMotion = useReducedMotion();
<motion.div
  animate={reduceMotion ? false : { y: 0 }}
  transition={{ duration: 0.4 }}
>
```

### 8.4 Virtualization

For long lists (calendar events, chat messages):

```tsx
import { useVirtualizer } from "@tanstack/react-virtual";
```

## 9. CSS Architecture

### 9.1 Custom Properties

All design tokens live in `:root` in `globals.css`:

```css
:root {
  --dashboard-navbar-h: 3.5rem;
  --dashboard-bottom-nav-h: 4.75rem;
  --dashboard-main-pad-y: 1rem;
  --dashboard-chrome: calc(...);
}
```

Responsive overrides via media queries:

```css
@media (min-width: 768px) {
  :root {
    --dashboard-bottom-nav-h: 0px;
  }
}
```

### 9.2 Utility Patterns

| Pattern            | Example                                     |
| ------------------ | ------------------------------------------- |
| Truncate text      | `truncate`, `line-clamp-2`                  |
| Prevent overflow   | `min-w-0`, `overflow-hidden`                |
| Responsive spacing | `space-y-3 sm:space-y-4 lg:space-y-6`       |
| Responsive padding | `p-4 sm:p-5 lg:p-6`                         |
| Responsive text    | `text-sm sm:text-base lg:text-lg`           |
| Responsive grid    | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` |
| Responsive flex    | `flex-col sm:flex-row`                      |
| Responsive display | `hidden md:block`, `md:hidden`              |

## 10. Testing Checklist

### Devices to Test

| Category     | Devices                                                             |
| ------------ | ------------------------------------------------------------------- |
| Small mobile | iPhone SE (375px), iPhone 12 Pro (390px), iPhone 14 Pro Max (430px) |
| Large mobile | Galaxy S21 (360px), Pixel 5 (393px)                                 |
| Tablet       | iPad Mini (768px), iPad Air (820px), iPad Pro (1024px)              |
| Desktop      | Laptop (1280px), Desktop (1440px), Large (1920px)                   |

### Test Categories

1. **Layout integrity**: No horizontal scroll, no clipped content
2. **Touch targets**: Minimum 44x44px on mobile
3. **Typography**: Readable at all sizes, no overflow
4. **Navigation**: Sidebar + bottom nav work correctly
5. **Forms**: Inputs accessible, labels visible, error messages readable
6. **Tables**: Horizontal scroll works, cells don't squish
7. **Charts**: Resize without breaking, legends remain readable
8. **Modals/Sheets**: Full screen on mobile, centered on desktop
9. **Dark mode**: Contrast ratios maintained at all breakpoints
10. **Orientation**: Portrait and landscape on mobile/tablet

### Automated Checks

```bash
# Run Lighthouse CI for responsive scores
npm run lint
npm run typecheck
npm run build

# Visual regression (if configured)
npm run test:visual
```

## 11. Common Patterns Reference

### 11.1 Responsive Card Grid

```tsx
<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {items.map((item) => (
    <Card key={item.id} className="p-4 sm:p-5">
      <h3 className="font-display text-lg sm:text-xl">{item.title}</h3>
      <p className="text-muted-foreground text-sm sm:text-base">{item.description}</p>
    </Card>
  ))}
</div>
```

### 11.2 Responsive Actions Row

```tsx
<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
  <Button className="w-full sm:w-auto">Primary</Button>
  <Button variant="outline" className="w-full sm:w-auto">
    Secondary
  </Button>
</div>
```

### 11.3 Responsive Section Spacing

```tsx
<section className="space-y-4 sm:space-y-6 lg:space-y-8">{/* Content */}</section>
```

### 11.4 Responsive Table Wrapper

```tsx
<div className="-mx-4 overflow-x-auto sm:mx-0">
  <table className="w-full min-w-[640px] text-sm">{/* Table content */}</table>
</div>
```

### 11.5 Responsive Modal/Sheet

```tsx
{
  /* Full screen on mobile, centered dialog on desktop */
}
<Sheet>
  <SheetContent side="bottom" className="max-h-[85vh] md:max-w-lg md:rounded-2xl">
    {/* Content */}
  </SheetContent>
</Sheet>;
```

## 12. Implementation Checklist

When building a new page or component:

- [ ] Use `min-w-0` on all flex/grid children
- [ ] Use `w-full sm:w-auto` on buttons
- [ ] Use responsive grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- [ ] Use responsive spacing: `space-y-4 sm:space-y-6`
- [ ] Use responsive padding: `p-4 sm:p-5 lg:p-6`
- [ ] Use responsive typography: `text-sm sm:text-base`
- [ ] Test at 375px, 768px, 1024px, 1440px
- [ ] Verify no horizontal overflow
- [ ] Check touch target sizes (min 44px)
- [ ] Verify dark mode contrast
- [ ] Test with screen reader
- [ ] Add `break-words` or `truncate` to dynamic text

## 13. Common Pitfalls to Avoid

1. **Fixed widths**: Never use `w-[500px]` without responsive fallbacks
2. **Horizontal overflow**: Always test with long unbroken strings
3. **Tiny tap targets**: Minimum 44x44px on mobile
4. **Hidden content**: Don't use `display: none` for critical content without mobile alternative
5. **Z-index stacking**: Ensure modals/sheets appear above all content
6. **Font sizing**: Never go below `text-xs` (12px) on mobile
7. **Line height**: Maintain `leading-snug` or `leading-relaxed` for readability
8. **Color contrast**: WCAG AA minimum (4.5:1 for text)

## 14. Future Enhancements

- **Container queries** (`@container`) for component-level responsiveness
- **CSS `size` container queries** for truly adaptive components
- **Fluid typography** with `clamp()` for smoother scaling
- **Subgrid** for complex card layouts
- **`:has()` selector** for parent-based responsive styling
