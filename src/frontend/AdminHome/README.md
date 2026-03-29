# Admin Landing Page

A premium admin landing page with Three.js background, GSAP animations, and modern UI components.

## Files Structure

```
admin/src/frontend/AdminHome/
├── AdminLanding.js      # Main component with all sections
├── AdminLanding.css     # Complete styles and animations
├── constants.js         # Color palette, gradients, and data arrays
└── README.md           # This file
```

## Features

- **Three.js Background**: Quantum nebula scene with stars, rings, and wireframe shapes
- **GSAP Animations**: Smooth scroll-triggered animations throughout
- **Premium Navbar**: Glass morphism design with mega dropdowns
- **Hero Section**: Typewriter effect with animated UI mockup
- **Stats Section**: Animated counters with intersection observer
- **Features Grid**: 6 power modules with hover effects
- **Testimonials**: Instructor feedback cards
- **Login Form**: Secure admin login with role selection
- **Custom Cursor**: Interactive cursor with hover states

## Components Included

1. **Navbar** - Fixed navigation with dropdowns
2. **Hero** - Landing section with typewriter and mockup
3. **Marquee** - Dual scrolling text bands
4. **Stats** - Animated number counters
5. **Features** - 6 feature cards with icons
6. **Testimonials** - 3 instructor testimonials
7. **CTA** - Call-to-action section
8. **Login** - Admin login form
9. **Footer** - Site footer with links

## Usage

The component is already imported in `admin/src/App.js`:

```javascript
import AdminLanding from './frontend/AdminHome/AdminLanding';

function App() {
  return <AdminLanding />;
}
```

## Running the App

```bash
cd admin
npm start
```

The app will open at `http://localhost:3000`

## Dependencies

- React 19.2.4
- Three.js 0.183.2
- GSAP 3.14.2 (loaded via CDN in component)

All dependencies are already installed in package.json.
