# Menu Page Design Implementation Instructions

## Overview
Apply the modern card-based menu design with circular food images, star ratings, and prominent call-to-action buttons while maintaining the project's Coral Zest color palette.

## Design Reference
The target design features:
- Circular food images with dashed border styling
- Card-based layout with white backgrounds
- Star ratings (visual feedback)
- Price display in red/coral color
- Light coral/pink "ORDER NOW" buttons
- Clean, modern spacing and typography
- Grid layout (responsive: 1 column mobile, 2-4 columns desktop)

---

## Implementation Tasks

### 1. **Create Menu Card Component** (`src/components/MenuCard.tsx`)

**Purpose:** Replace the current list-based menu items with modern card components

**Component Structure:**
```tsx
interface MenuCardProps {
  id: string;
  name: string;
  image: string;        // URL to food image
  rating: number;       // 1-5 stars
  subtitle: string;     // e.g., "Ceviche Porteño Tradicional"
  price: number;
  quantity: number;
  onQuantityChange: (id: string, quantity: number) => void;
}
```

**Key Features:**
- **Circular Image Container:**
  - Use `aspect-square` for perfect circle
  - Apply dashed border: `border-4 border-dashed border-slate-300`
  - Add subtle shadow: `shadow-md`
  - Responsive sizing: `w-32 h-32 md:w-40 md:h-40`
  - Center the image container: `mx-auto`

- **Star Rating Display:**
  - Render 5 stars (filled/outlined based on rating)
  - Use Coral color for filled stars: `text-orange-600`
  - Use gray for empty stars: `text-slate-300`
  - Size: `text-lg` or `text-xl`

- **Title Styling:**
  - Font: `font-bold text-xl md:text-2xl`
  - Color: `text-slate-900`
  - Alignment: `text-center`

- **Subtitle Text:**
  - Font: `text-sm text-slate-600`
  - Alignment: `text-center`
  - Spacing: `mt-1 mb-3`

- **Price Display:**
  - **Color: Coral Zest primary** (`text-orange-600`)
  - Font: `text-2xl font-bold`
  - Format: `$XX.XX` (use formatPrice utility)
  - Center alignment

- **Order Now Button:**
  - **Background:** Light coral/pink `bg-orange-100 hover:bg-orange-200`
  - **Text color:** Coral primary `text-orange-600 font-semibold`
  - **Icon:** Shopping cart icon from lucide-react or similar
  - **Full width:** `w-full`
  - **Rounded:** `rounded-full`
  - **Padding:** `py-3 px-6`
  - **Transition:** `transition-colors duration-200`
  - Replace button with CevicheCounter when quantity > 0

**Card Container Styling:**
```tsx
className="bg-white rounded-2xl shadow-lg hover:shadow-xl
  transition-shadow duration-300 p-6 border-2 border-slate-100
  hover:border-orange-300"
```

---

### 2. **Update MenuCeviches Component** (`src/components/MenuCeviches.tsx`)

**Changes Required:**

**A. Update Grid Layout:**
```tsx
// Current: grid-cols-1 md:grid-cols-2
// New: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
  {ceviches.map((ceviche) => (
    <MenuCard
      key={ceviche.id}
      id={ceviche.id}
      name={ceviche.name}
      image={ceviche.image || '/placeholder-ceviche.jpg'}
      rating={ceviche.rating || 4}
      subtitle="Ceviche Porteño Tradicional"
      price={ceviche.price}
      quantity={cartItems[ceviche.id] || 0}
      onQuantityChange={handleQuantityChange}
    />
  ))}
</div>
```

**B. Update Background Gradient:**
```tsx
// Current: from-blue-50 to-green-50
// New: from-orange-50 to-orange-100

<div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 pb-32">
```

**C. Update Section Headers:**
```tsx
// Current: text-blue-800 border-b-2 border-blue-300
// New: text-slate-900 border-b-2 border-orange-300

<h2 className="text-2xl md:text-3xl font-bold text-slate-900
  mb-6 pb-3 border-b-2 border-orange-300">
```

**D. Update Cart Summary Styling:**
```tsx
// Background: from-orange-600 to-orange-500
// Text: white
// Hover: from-orange-700 to-orange-600

<div className="fixed bottom-0 left-0 right-0 bg-white border-t-2
  border-orange-200 shadow-lg p-4 z-40">
  <div className="max-w-7xl mx-auto flex items-center justify-between">
    <div className="flex items-center gap-4">
      <span className="text-slate-900 font-semibold">
        Total Items: {totalItems}
      </span>
      <span className="text-2xl font-bold text-orange-600">
        ${formatPrice(totalPrice)}
      </span>
    </div>
    <button className="bg-gradient-to-r from-orange-600 to-orange-500
      hover:from-orange-700 hover:to-orange-600 text-white font-bold
      py-3 px-8 rounded-full transition-all duration-200 shadow-md
      hover:shadow-lg">
      Checkout
    </button>
  </div>
</div>
```

---

### 3. **Add Placeholder Food Images**

**Task:** Create placeholder images or add real food photography

**Options:**

**A. Use Placeholder Service (Quick Implementation):**
```tsx
// In types.ts, add image field to Ceviche interface
export interface Ceviche {
  id: string;
  name: string;
  ingredients: Ingredient[];
  cost: number;
  price: number;
  image?: string;  // Add this
  rating?: number; // Add this
}

// Generate placeholder URLs based on ceviche type
const getPlaceholderImage = (cevicheId: string): string => {
  const imageMap: Record<string, string> = {
    'pescado': 'https://images.unsplash.com/photo-1559737558-2f2c99e9b3e7?w=400',
    'camaron': 'https://images.unsplash.com/photo-1559737558-2f2c99e9b3e7?w=400',
    'pulpo': 'https://images.unsplash.com/photo-1559737558-2f2c99e9b3e7?w=400',
    'piangua': 'https://images.unsplash.com/photo-1559737558-2f2c99e9b3e7?w=400',
    // Add more mappings for combinations
  };
  return imageMap[cevicheId] || '/placeholder-ceviche.jpg';
};
```

**B. Local Assets (Production Ready):**
1. Create folder: `src/assets/ceviches/`
2. Add images: `pescado.jpg`, `camaron.jpg`, `pulpo.jpg`, `piangua.jpg`, etc.
3. Use object URLs: `pescado: '/src/assets/ceviches/pescado.jpg'`
4. Optimize images: 400x400px, compressed JPG/WebP

**C. Fallback Strategy:**
```tsx
// In MenuCard component
<img
  src={image}
  alt={name}
  onError={(e) => {
    e.currentTarget.src = '/placeholder-ceviche.jpg';
  }}
  className="w-full h-full object-cover rounded-full"
/>
```

---

### 4. **Create Star Rating Component** (`src/components/StarRating.tsx`)

```tsx
import React from 'react';

interface StarRatingProps {
  rating: number; // 0-5
  maxStars?: number; // default 5
  size?: 'sm' | 'md' | 'lg';
  color?: string; // default 'orange-600'
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 'md',
  color = 'orange-600'
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl'
  };

  return (
    <div className="flex items-center justify-center gap-1">
      {[...Array(maxStars)].map((_, index) => (
        <span
          key={index}
          className={`${sizeClasses[size]} ${
            index < rating ? `text-${color}` : 'text-slate-300'
          }`}
        >
          {index < rating ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
};
```

**Usage in MenuCard:**
```tsx
<StarRating rating={rating} size="md" color="orange-600" />
```

---

### 5. **Update Color Palette Throughout**

**Files to Update:**

**A. MenuCeviches.tsx**
- Background: `from-orange-50 to-orange-100`
- Section borders: `border-orange-300`
- Card hover borders: `hover:border-orange-300`
- Prices: `text-orange-600`
- Buttons: `from-orange-600 to-orange-500`

**B. CevicheCounter.tsx**
- Plus button: Keep green for adding (`bg-teal-600`)
- Minus button: Keep current style
- Focus states: `focus:ring-orange-500`

**C. Header.tsx** (if not already updated)
- Background: `bg-white border-b-2 border-orange-200`
- Links: `text-slate-700 hover:text-orange-600`
- Active links: `text-orange-600`

---

### 6. **Responsive Design Adjustments**

**Breakpoint Strategy:**
```tsx
// Mobile: 1 column
// Tablet: 2 columns (sm:)
// Desktop: 3 columns (lg:)
// Large Desktop: 4 columns (xl:)

<div className="container mx-auto px-4 sm:px-6 lg:px-8">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
    {/* Cards */}
  </div>
</div>
```

**Card Spacing:**
- Padding: `p-4 md:p-6`
- Gap between cards: `gap-4 sm:gap-6 lg:gap-8`
- Container padding: `px-4 sm:px-6 lg:px-8`

**Image Sizing:**
- Mobile: `w-32 h-32` (128px)
- Desktop: `md:w-40 md:h-40` (160px)

---

### 7. **Add Default Ratings to Ceviche Data**

**In MenuPage.tsx or data processing:**
```tsx
// Add ratings based on ingredient complexity or popularity
const addDefaultRatings = (ceviches: Ceviche[]): Ceviche[] => {
  return ceviches.map(ceviche => ({
    ...ceviche,
    rating: ceviche.rating || calculateDefaultRating(ceviche),
  }));
};

const calculateDefaultRating = (ceviche: Ceviche): number => {
  // Example logic: more ingredients = higher rating
  const ingredientCount = ceviche.ingredients.length;
  if (ingredientCount >= 4) return 5;
  if (ingredientCount === 3) return 4;
  if (ingredientCount === 2) return 4;
  return 4; // Default
};
```

---

### 8. **Performance Optimizations**

**A. Image Lazy Loading:**
```tsx
<img
  src={image}
  alt={name}
  loading="lazy"
  className="w-full h-full object-cover rounded-full"
/>
```

**B. Memoize Card Components:**
```tsx
import React, { memo } from 'react';

export const MenuCard = memo<MenuCardProps>(({ ... }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return prevProps.quantity === nextProps.quantity &&
         prevProps.price === nextProps.price;
});
```

**C. Optimize Images:**
- Use WebP format with JPG fallback
- Size: 400x400px max
- Compression: 80% quality
- Consider using `srcset` for different device densities

---

### 9. **Accessibility Enhancements**

**A. Add ARIA Labels:**
```tsx
<button
  aria-label={`Add ${name} to cart`}
  className="..."
>
  ORDER NOW
</button>
```

**B. Star Rating Accessibility:**
```tsx
<div
  role="img"
  aria-label={`Rating: ${rating} out of 5 stars`}
  className="flex items-center justify-center gap-1"
>
  {/* Stars */}
</div>
```

**C. Focus Indicators:**
```tsx
className="focus:outline-none focus:ring-2 focus:ring-orange-500
  focus:ring-offset-2 rounded-full"
```

---

### 10. **Testing Checklist**

**Visual Testing:**
- [ ] Cards display correctly on mobile (320px width)
- [ ] Cards display correctly on tablet (768px)
- [ ] Cards display correctly on desktop (1024px+)
- [ ] Images load and display as circles with dashed border
- [ ] Star ratings render correctly
- [ ] Prices are clearly visible in Coral color
- [ ] Hover states work on all interactive elements
- [ ] Cart summary sticky footer doesn't overlap content

**Functional Testing:**
- [ ] ORDER NOW button adds item to cart
- [ ] CevicheCounter appears after first addition
- [ ] Quantity changes update cart total
- [ ] Cart summary shows correct totals
- [ ] Checkout button navigation works
- [ ] Image fallbacks work when image fails to load

**Color Palette Verification:**
- [ ] No blue/green colors remain (except success indicators)
- [ ] Coral Zest (#F97316) used for primary actions
- [ ] Prices display in orange-600
- [ ] Buttons use orange-100/orange-200 for backgrounds
- [ ] Hover states use orange-700
- [ ] Borders use slate-200 or orange-300

**Performance Testing:**
- [ ] Page loads in under 3 seconds
- [ ] Images lazy load correctly
- [ ] No layout shift when images load
- [ ] Smooth scrolling and transitions
- [ ] No console errors or warnings

---

## Color Reference Quick Guide

| Element | Color | Tailwind Class |
|---------|-------|----------------|
| **Primary CTA (ORDER NOW)** | Light coral bg | `bg-orange-100 hover:bg-orange-200` |
| **CTA Text** | Coral primary | `text-orange-600` |
| **Prices** | Coral primary | `text-orange-600 font-bold` |
| **Star Ratings** | Coral filled, Gray empty | `text-orange-600` / `text-slate-300` |
| **Card Borders** | Slate light | `border-slate-100 hover:border-orange-300` |
| **Image Border** | Slate dashed | `border-slate-300 border-dashed` |
| **Background** | Coral gradient | `from-orange-50 to-orange-100` |
| **Text Primary** | Slate dark | `text-slate-900` |
| **Text Secondary** | Slate medium | `text-slate-600` |
| **Section Borders** | Coral medium | `border-orange-300` |
| **Checkout Button** | Coral gradient | `from-orange-600 to-orange-500` |

---

## Implementation Order

1. **Phase 1: Core Components**
   - Create StarRating component
   - Create MenuCard component
   - Test components in isolation

2. **Phase 2: Integration**
   - Update MenuCeviches layout
   - Replace old cards with new MenuCard
   - Update color scheme throughout

3. **Phase 3: Assets**
   - Add placeholder images
   - Configure image fallbacks
   - Optimize image loading

4. **Phase 4: Polish**
   - Add hover animations
   - Test responsive breakpoints
   - Verify accessibility
   - Performance optimization

5. **Phase 5: Testing**
   - Complete testing checklist
   - Fix any issues found
   - Cross-browser testing
   - Mobile device testing

---

## Notes

- **Subtitle "The Registration Fee":** In the reference design, this appears to be a placeholder. For your ceviche menu, use "Ceviche Porteño Tradicional" or similar descriptive text
- **Image Quality:** Prioritize high-quality food photography for production
- **Consistency:** Ensure all 15 ceviche varieties have images in similar style
- **Loading States:** Consider adding skeleton screens while images load
- **Error States:** Provide clear fallback when images fail to load

---

## File Structure Summary

```
src/
├── components/
│   ├── MenuCard.tsx           ← NEW: Individual menu card
│   ├── StarRating.tsx         ← NEW: Star rating display
│   ├── MenuCeviches.tsx       ← UPDATE: Grid layout & colors
│   ├── CevicheCounter.tsx     ← UPDATE: Color adjustments
│   └── Header.tsx             ← VERIFY: Colors updated
├── assets/
│   └── ceviches/              ← NEW: Food images folder
│       ├── pescado.jpg
│       ├── camaron.jpg
│       ├── pulpo.jpg
│       └── piangua.jpg
├── types.ts                   ← UPDATE: Add image & rating fields
└── utils.ts                   ← VERIFY: formatPrice utility exists
```

---

## Additional Resources

- **Color Palette:** `/docs/COLOR_PALETTE.md`
- **Architecture:** `/docs/ARCHITECTURE.md`
- **Tailwind Config:** `/tailwind.config.js`

---

## Success Criteria

✅ Menu displays in modern card grid layout
✅ Circular images with dashed borders render correctly
✅ Star ratings visible on all items
✅ Coral Zest color palette applied consistently
✅ ORDER NOW buttons styled per design
✅ Responsive across all device sizes
✅ No blue/green colors remaining
✅ Cart functionality preserved and working
✅ Accessible to keyboard and screen reader users
✅ Fast loading and smooth interactions
