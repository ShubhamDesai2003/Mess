# 🎨 Visual Design Guide - Forecast Dashboard

## Color Scheme

### Primary Colors
```css
/* Dashboard Background */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Weekly Forecast Theme */
Primary: #667eea (Indigo Blue)
Secondary: #764ba2 (Purple)

/* Ingredient Forecast Theme */
Primary: #059669 (Emerald Green)
Secondary: #047857 (Dark Green)

/* Recommendations Theme */
Primary: #DC2626 (Red)
Secondary: #991b1b (Dark Red)
```

### Meal Type Colors
```css
Breakfast: #F59E0B (Amber/Orange)
Lunch: #10B981 (Emerald Green)
Dinner: #6366F1 (Indigo)
```

### Neutral Colors
```css
Background White: #FFFFFF
Light Gray: #F8FAFC
Medium Gray: #E2E8F0
Text Dark: #1E293B
Text Light: #64748B
```

---

## Component Hierarchy

```
ForecastDashboard (Main Container)
│
├── Header Section
│   ├── AI Activity Icon (animated pulse)
│   ├── Title: "AI-Powered Analytics"
│   ├── Subtitle: "Intelligent forecasting..."
│   └── Stats Cards (Accuracy, AI Models)
│
├── Tab Navigation
│   ├── Weekly Forecast Tab (Blue gradient)
│   ├── Ingredient Planning Tab (Green gradient)
│   └── Smart Recommendations Tab (Red gradient)
│
└── Content Section (Dynamic based on active tab)
    │
    ├── Weekly Forecast Page
    │   ├── Header (Title + Date Range + Refresh Button)
    │   ├── Metrics Cards (Total, Average, Busiest Day)
    │   ├── Chart Toggle (Bar/Line)
    │   ├── Main Chart (Bar or Line)
    │   ├── Meal Breakdown (Progress bars)
    │   ├── Detailed Table
    │   └── Footer (Last updated timestamp)
    │
    ├── Ingredient Forecast Page
    │   ├── Header (Title + Month + Refresh Button)
    │   ├── Metrics Cards (Total, Top Item, Max Quantity)
    │   ├── Sort Toggle (Quantity/Name)
    │   ├── Horizontal Bar Chart (Top 10)
    │   ├── Top 5 List (Ranked cards)
    │   ├── Complete Table
    │   └── Footer (Last updated timestamp)
    │
    └── Recommendations Page
        ├── Header (Title + Subtitle + Refresh Button)
        ├── Popular Trends Section
        │   ├── Section Header
        │   ├── Pie Chart
        │   └── Ranked List (with trend badges)
        ├── User Favorites Section
        │   ├── Section Header
        │   ├── Bar Chart
        │   └── Favorite Cards Grid
        └── AI Insights Card (Gradient background)
            ├── Most Popular
            ├── Total Orders
            └── User's Top Choice
```

---

## Typography Scale

```css
/* Headers */
h1 (Main Dashboard): 2.5rem / 40px - Weight: 700
h2 (Page Titles): 1.75rem / 28px - Weight: 700
h3 (Section Titles): 1.5rem / 24px - Weight: 700
h4 (Card Titles): 1.25rem / 20px - Weight: 700

/* Body Text */
Large: 1.125rem / 18px - Weight: 600
Regular: 1rem / 16px - Weight: 400-600
Small: 0.875rem / 14px - Weight: 500
Extra Small: 0.75rem / 12px - Weight: 600
```

---

## Spacing System

```css
/* Base unit: 0.25rem (4px) */
xs: 0.25rem   (4px)
sm: 0.5rem    (8px)
md: 1rem      (16px)
lg: 1.5rem    (24px)
xl: 2rem      (32px)
2xl: 3rem     (48px)

/* Common uses */
Card padding: 1.5rem - 2rem
Section gaps: 1.5rem - 2rem
Button padding: 0.75rem 1.5rem
Icon gaps: 0.5rem - 0.75rem
```

---

## Border Radius

```css
Small: 8px   (badges, buttons)
Medium: 12px (cards, inputs)
Large: 16px  (section cards)
Extra Large: 20px (main containers)
Circle: 50% (dots, avatars)
```

---

## Shadows

```css
/* Light shadow - default cards */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

/* Medium shadow - hover state */
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);

/* Heavy shadow - featured elements */
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);

/* Colored shadow - primary buttons */
box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
```

---

## Animations

### Durations
```css
Fast: 0.2s   (micro-interactions)
Normal: 0.3s (standard transitions)
Slow: 0.5s   (page transitions)
Chart: 0.8s  (data animations)
```

### Easing
```css
ease: cubic-bezier(0.25, 0.1, 0.25, 1)
ease-in-out: cubic-bezier(0.42, 0, 0.58, 1)
```

### Common Animations
```css
/* Hover lift */
transform: translateY(-4px);
transition: all 0.3s ease;

/* Button press */
transform: scale(0.98);
transition: all 0.2s ease;

/* Fade in */
opacity: 0 → 1;
transition: opacity 0.3s ease;

/* Slide up */
transform: translateY(20px) → translateY(0);
transition: transform 0.3s ease;

/* Spin (loading) */
transform: rotate(360deg);
animation: spin 1s linear infinite;
```

---

## Gradient Presets

```css
/* Primary Gradient (Purple) */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Success Gradient (Green) */
background: linear-gradient(135deg, #059669 0%, #047857 100%);

/* Danger Gradient (Red) */
background: linear-gradient(135deg, #DC2626 0%, #991b1b 100%);

/* Pink Gradient */
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);

/* Blue Gradient */
background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

/* Light Gradient (backgrounds) */
background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
```

---

## Icon Usage

### Icons from react-icons/fi (Feather Icons)

```javascript
FiActivity      // Dashboard header
FiTrendingUp    // Weekly forecast, trending
FiPackage       // Ingredients
FiStar          // Recommendations
FiRefreshCw     // Refresh buttons
FiCalendar      // Date display
FiClock         // Timestamps
FiShoppingCart  // Shopping/procurement
FiUser          // User favorites
FiBarChart2     // Stats
FiPieChart      // Stats
```

### Emoji Icons (for visual appeal)
```
📊 Analytics
📦 Package/Box
🥇 Winner/Top
📈 Growth
🔥 Trending
⭐ Star/Favorite
💡 Insights
🎯 Target
⚡ Quick/Fast
```

---

## Responsive Breakpoints

```css
/* Mobile First Approach */
Mobile: 0px - 767px      (1 column layouts)
Tablet: 768px - 1023px   (2 column, stacked)
Desktop: 1024px+         (full layouts)

/* Media Queries */
@media (max-width: 768px) {
  /* Mobile styles */
  .chartsGrid { grid-template-columns: 1fr; }
  .pageTitle { font-size: 1.5rem; }
}

@media (max-width: 1024px) {
  /* Tablet styles */
  .statsOverview { flex-direction: column; }
}
```

---

## Component States

### Loading State
```css
.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f1f5f9;
  border-top-color: #667eea;
  animation: spin 1s linear infinite;
}
```

### Error State
```css
.errorContainer {
  text-align: center;
  padding: 2rem;
}
.errorIcon { font-size: 4rem; }
.retryButton { /* Primary gradient */ }
```

### Empty State
```css
.emptyState {
  text-align: center;
  color: #64748b;
  padding: 3rem;
}
```

### Hover State
```css
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}
```

---

## Accessibility

### Contrast Ratios
```
Background to text: 4.5:1 minimum
Button text: 4.5:1 minimum
Large text (18px+): 3:1 minimum
```

### Focus States
```css
button:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}
```

### ARIA Labels
```javascript
<button aria-label="Refresh forecast data">
  <FiRefreshCw />
  Refresh
</button>
```

---

## Chart Configurations

### Bar Chart
```javascript
<BarChart>
  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
  <XAxis stroke="#64748b" />
  <YAxis stroke="#64748b" />
  <Bar radius={[8, 8, 0, 0]} /> // Rounded top corners
</BarChart>
```

### Line Chart
```javascript
<LineChart>
  <Line strokeWidth={3} type="monotone" />
</LineChart>
```

### Pie Chart
```javascript
<PieChart>
  <Pie outerRadius={100} label={...} />
</PieChart>
```

### Tooltip Style
```javascript
<Tooltip 
  contentStyle={{
    background: 'rgba(255, 255, 255, 0.95)',
    border: 'none',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  }}
/>
```

---

## Best Practices

### 1. **Consistent Spacing**
- Use the spacing system (0.25rem multiples)
- Maintain consistent gaps between sections
- Use padding for internal spacing, margin for external

### 2. **Color Usage**
- Stick to the defined color palette
- Use gradients for primary actions
- Maintain color consistency across components

### 3. **Typography**
- Max 3-4 font sizes per page
- Consistent line heights (1.5 for body, 1.2 for headers)
- Use font weights intentionally (400, 600, 700)

### 4. **Animations**
- Keep under 0.5s for most transitions
- Use ease-in-out for smooth motion
- Avoid excessive animations

### 5. **Accessibility**
- Always include aria-labels
- Maintain color contrast
- Ensure keyboard navigation works
- Test with screen readers

---

## Quick Reference

### Most Used Classes
```css
.pageContainer      // Main wrapper
.header            // Section header
.pageTitle         // Main title
.refreshButton     // Action button
.metricsGrid       // Stats cards grid
.chartCard         // Chart container
.tableCard         // Table container
.footer            // Bottom timestamp
```

### Most Used Gradients
```css
Purple: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
Green:  linear-gradient(135deg, #059669 0%, #047857 100%)
Red:    linear-gradient(135deg, #DC2626 0%, #991b1b 100%)
Light:  linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)
```

### Most Used Shadows
```css
Light:  0 4px 12px rgba(0, 0, 0, 0.05)
Medium: 0 8px 24px rgba(0, 0, 0, 0.1)
Heavy:  0 20px 60px rgba(0, 0, 0, 0.1)
```

---

This visual guide ensures consistency across the entire forecast dashboard! 🎨
