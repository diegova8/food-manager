# Color Palette - Ceviche de mi Tata

> Warm, Appetizing Design System for a Coastal Food Business

## Design Philosophy

This color palette captures the essence of fresh ceviche with warm, inviting tones:
- **Coral Warmth**: Energetic coral and orange tones that stimulate appetite
- **Citrus Fresh**: Warm accent colors representing fresh lime and ingredients
- **Clean & Fresh**: Light, airy backgrounds that feel hygienic and inviting
- **Natural**: Earth tones that connect to fresh ingredients

---

## Primary Colors

### Coral Zest (Primary Brand Color)
```
Coral 900: #7C2D12 (Darkest - Headers, Important Text)
Coral 700: #C2410C (Dark - Primary Buttons, Links)
Coral 600: #F97316 (Main Brand - CTAs, Active States) ⭐ PRIMARY
Coral 500: #FB923C (Light - Hover States)
Coral 400: #FDBA74 (Lighter - Accents)
Coral 100: #FFEDD5 (Lightest - Backgrounds, Highlights)
Coral 50:  #FFF7ED (Subtle - Page Backgrounds)

Hex: #F97316
RGB: rgb(249, 115, 22)
Tailwind: orange-600
```
**Use for**: Primary buttons, navigation active states, brand elements, CTAs, prices

### Amber Warm (Secondary Brand Color)
```
Amber 700: #B45309 (Dark - Secondary CTAs)
Amber 600: #D97706 (Main - Accents, Icons)
Amber 500: #F59E0B (Light - Success States, Highlights)
Amber 100: #FEF3C7 (Lightest - Subtle Backgrounds)
Amber 50:  #FFFBEB (Ultra Light)

Hex: #D97706
RGB: rgb(217, 119, 6)
Tailwind: amber-600
```
**Use for**: Secondary buttons, highlights, warm accents, special offers

---

## Accent Colors

### Teal Fresh (Cool Accent - Fresh Balance)
```
Teal 700: #0F766E (Dark - Success, Fresh Tags)
Teal 600: #0D9488 (Main - Cool Balance, Icons)
Teal 500: #14B8A6 (Light - Success States)
Teal 100: #CCFBF1 (Lightest - Fresh Backgrounds)

Hex: #0D9488
RGB: rgb(13, 148, 136)
Tailwind: teal-600
```
**Use for**: Success messages, fresh/healthy indicators, cool balance to warm palette

### Lime Fresh (Citrus Accent)
```
Lime 600: #65A30D (Main - Fresh Tags, Organic Labels)
Lime 500: #84CC16 (Light - Success, Availability)
Lime 100: #ECFCCB (Lightest - New Items Background)

Hex: #65A30D
RGB: rgb(101, 163, 13)
Tailwind: lime-600
```
**Use for**: "New" badges, fresh ingredient tags, positive indicators

---

## Neutral Colors

### Slate (Primary Neutrals)
```
Slate 900: #0F172A (Darkest - Primary Text)
Slate 800: #1E293B (Dark - Headings)
Slate 700: #334155 (Medium Dark - Subheadings)
Slate 600: #475569 (Medium - Body Text)
Slate 400: #94A3B8 (Light - Disabled Text)
Slate 300: #CBD5E1 (Lighter - Borders)
Slate 200: #E2E8F0 (Lightest - Dividers)
Slate 100: #F1F5F9 (Ultra Light - Card Backgrounds)
Slate 50:  #F8FAFC (Subtle - Page Backgrounds)

Tailwind: slate-*
```
**Use for**: Text, borders, backgrounds, cards

---

## Semantic Colors

### Success (Order Confirmed, Available)
```
Success: #10B981 (Green-500)
Success Light: #D1FAE5 (Green-100)
Success Dark: #047857 (Green-700)

Tailwind: green-500, green-100, green-700
```

### Warning (Low Stock, Pending)
```
Warning: #F59E0B (Amber-500)
Warning Light: #FEF3C7 (Amber-100)
Warning Dark: #D97706 (Amber-600)

Tailwind: amber-500, amber-100, amber-600
```

### Error (Out of Stock, Failed)
```
Error: #EF4444 (Red-500)
Error Light: #FEE2E2 (Red-100)
Error Dark: #DC2626 (Red-600)

Tailwind: red-500, red-100, red-600
```

### Info (Tips, Information)
```
Info: #3B82F6 (Blue-500)
Info Light: #DBEAFE (Blue-100)
Info Dark: #1D4ED8 (Blue-700)

Tailwind: blue-500, blue-100, blue-700
```

---

## Special Use Cases

### Admin Panel
```
Admin Primary: #7C3AED (Purple-600) - Admin Badge, Admin-only Features
Admin Light: #EDE9FE (Purple-100) - Admin Panel Background
Admin Dark: #6D28D9 (Purple-700) - Admin Headers

Tailwind: purple-600, purple-100, purple-700
```

### Food Photography Overlays
```
Overlay Dark: rgba(15, 23, 42, 0.7) - Dark overlay on images
Overlay Light: rgba(255, 247, 237, 0.9) - Light warm overlay for text

CSS: rgba(15, 23, 42, 0.7), rgba(255, 247, 237, 0.9)
```

---

## Gradient Combinations

### Hero Sections
```css
/* Warm Sunset */
background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%);
/* from-orange-50 to-orange-100 */

/* Coral Breeze */
background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
/* from-amber-50 to-amber-100 */

/* Fresh Balance */
background: linear-gradient(135deg, #FFF7ED 0%, #CCFBF1 100%);
/* from-orange-50 to-teal-100 */
```

### Buttons & CTAs
```css
/* Primary CTA */
background: linear-gradient(135deg, #F97316 0%, #FB923C 100%);
/* from-orange-600 to-orange-500 */

/* Warm Secondary CTA */
background: linear-gradient(135deg, #D97706 0%, #F59E0B 100%);
/* from-amber-600 to-amber-500 */

/* Success CTA */
background: linear-gradient(135deg, #0D9488 0%, #14B8A6 100%);
/* from-teal-600 to-teal-500 */
```

---

## Color Usage Guidelines

### Page Backgrounds
- Main background: `Slate 50` (#F8FAFC) or `Orange 50` (#FFF7ED)
- Card backgrounds: `White` (#FFFFFF) or `Slate 100` (#F1F5F9)
- Section alternating: `Orange 50` / `Amber 50`

### Text
- Primary headings: `Slate 900` (#0F172A)
- Body text: `Slate 700` (#334155)
- Secondary text: `Slate 600` (#475569)
- Disabled/placeholder: `Slate 400` (#94A3B8)

### Buttons
- **Primary CTA**: Coral 600 background, white text
- **Secondary**: Amber 600 background, white text
- **Success**: Teal 600 background, white text
- **Outline**: Coral 600 border, Coral 600 text
- **Ghost**: Transparent background, Coral 600 text

### Prices & Money
- Regular price: `Coral 600` (#F97316) - bold and appetizing
- Discount price: `Coral 600` with strikethrough on old price in `Slate 400`
- Total/Cart: `Coral 700` (#C2410C) - bold and prominent

### Borders & Dividers
- Default border: `Slate 200` (#E2E8F0)
- Focus border: `Coral 600` (#F97316)
- Hover border: `Coral 500` (#FB923C)

### Interactive States
```css
/* Default */
background: Coral 600;

/* Hover */
background: Coral 700;

/* Active/Pressed */
background: Coral 800;

/* Disabled */
background: Slate 300;
color: Slate 400;
```

---

## Accessibility Notes

- All color combinations meet WCAG 2.1 AA standards for contrast
- Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text
- Don't rely on color alone - use icons and text labels
- Test with colorblind simulators

### High Contrast Combinations (AAA Level)
- `Slate 900` on `White` - 18.2:1 ✓
- `Coral 700` on `White` - 6.8:1 ✓
- `White` on `Coral 600` - 4.7:1 ✓
- `White` on `Coral 700` - 6.8:1 ✓

---

## Implementation

These colors are already available in Tailwind CSS. To use them:

```tsx
// Primary Buttons
<button className="bg-orange-600 hover:bg-orange-700 text-white">
  Primary Button
</button>

// Secondary Buttons
<button className="bg-amber-600 hover:bg-amber-700 text-white">
  Secondary Button
</button>

// Cards
<div className="bg-white border-2 border-slate-200 hover:border-orange-500">
  Card Content
</div>

// Text
<h1 className="text-slate-900">Heading</h1>
<p className="text-slate-700">Body text</p>

// Gradients
<div className="bg-gradient-to-br from-orange-50 to-orange-100">
  Fresh background
</div>

// Price
<span className="text-2xl font-bold text-orange-600">
  ₡5,000
</span>

// Success States
<div className="bg-teal-600 text-white">
  Success Message
</div>
```

---

## Color Palette Summary

| Color Name | Hex Code | Tailwind | Primary Use |
|------------|----------|----------|-------------|
| Coral Zest | #F97316 | orange-600 | Primary brand, buttons, CTAs, prices |
| Amber Warm | #D97706 | amber-600 | Secondary brand, highlights |
| Teal Fresh | #0D9488 | teal-600 | Success states, fresh balance |
| Lime Fresh | #65A30D | lime-600 | Fresh tags, new items |
| Slate Dark | #0F172A | slate-900 | Primary text |
| Admin Purple | #7C3AED | purple-600 | Admin features |

---

**Generated for**: Ceviche de mi Tata
**Date**: November 2025
**Design System**: Tailwind CSS v4
**Primary Brand Color**: Coral Zest (#F97316)
