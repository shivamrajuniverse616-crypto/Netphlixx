# UI & UX Animation Context (Netphlix)

This document outlines the UI and UX animations extracted from the Netphlix app, to serve as inspiration for the Modi-fy music app.

## Animation Libraries
- **Framer Motion**: Used for complex spring physics, layout animations, and presence transitions.
- **Tailwind CSS**: Used for utility-based hover states, scaling, fading, and responsive design.
- **Custom CSS Keyframes**: Used for skeleton loading screens and custom pings.

## Key UI Components & Animations

1. **Magnetic Buttons**
   - **Physics**: Uses `framer-motion` `useSpring` and `useMotionValue` to create a magnetic pull effect towards the cursor.
   - **Ripple Effect**: On click, a growing circular ripple is animated from `scale: 0, opacity: 0.5` to `scale: 4, opacity: 0`.

2. **Hero Section**
   - **Dynamic Gradient**: Extracts the dominant color from the banner image using `fast-average-color` and creates a radial gradient overlay that transitions smoothly.
   - **Fade-in Elements**: Title and description slide in from the left using Framer Motion (`x: -50` to `x: 0`) on load.

3. **Navbar & Modals**
   - **Glassmorphism**: Navbar becomes a blurred, semi-transparent background when the user scrolls.
   - **Settings Modal**: Uses Tailwind's `animate-in`, `fade-in`, and `zoom-in-95` to pop into view smoothly.

4. **Media Row Cards**
   - **Hover Scaling**: Cards scale up to `1.05` on hover using Framer Motion spring physics.
   - **Trailer Autoplay**: After a brief hover delay, the static image crossfades into a playing YouTube trailer iframe.
   - **Hover Portal**: Expanded information uses a React Portal to break out of overflow constraints, animating in from `scale: 0.9` to `1.15`.

5. **Loading States**
   - **Shimmer Skeleton**: `placeholderShimmer` keyframe animation translates a linear gradient across the background to indicate loading tracks/movies.
