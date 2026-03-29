# Three.js & GSAP - Organized Structure

## 📁 Complete Folder Organization

```
admin/src/frontend/AdminHome/
│
├── 📁 three/                    ✅ Three.js Organization
│   ├── index.js                # Main entry point & React hook
│   ├── config.js               # Scene configuration
│   ├── scene.js                # Object creation functions
│   └── animator.js             # Animation controller
│
├── 📁 animations/               ✅ GSAP Organization
│   ├── index.js                # Animation manager & loader
│   ├── gsapConfig.js           # Animation presets & config
│   ├── heroAnimations.js       # Hero section animations
│   ├── navbarAnimations.js     # Navbar animations
│   └── scrollAnimations.js     # Scroll-triggered animations
│
├── 📁 components/               # UI Components
├── 📁 hooks/                    # Custom hooks
├── constants.js                 # Data & colors
└── AdminLanding.css             # Styles
```

---

## 🎨 Three.js Structure

### 📄 three/index.js
**Purpose:** Main Three.js manager and React hook

**Exports:**
- `ThreeBackground` class - Main scene manager
- `useThreeBackground(canvasRef)` - React hook

**Usage:**
```javascript
import { useThreeBackground } from './three';

function Component() {
  const canvasRef = useRef(null);
  useThreeBackground(canvasRef);
  
  return <canvas ref={canvasRef} />;
}
```

---

### 📄 three/config.js
**Purpose:** Centralized configuration

**Exports:**
- `STAR_LAYERS` - 6 star layer configurations
- `TORUS_RINGS` - 5 torus ring configurations
- `WIREFRAME_SHAPES` - 8 shape configurations
- `CAMERA_CONFIG` - Camera settings
- `ANIMATION_SPEEDS` - Animation speed constants

**Example:**
```javascript
export const STAR_LAYERS = [
  { name: 'white', count: 3200, spread: 300, size: 0.055, opacity: 0.15 },
  { name: 'violet', count: 480, spread: 220, size: 0.09, opacity: 0.08, color: 0x7c3aff },
  // ... more layers
];
```

---

### 📄 three/scene.js
**Purpose:** Object creation functions

**Exports:**
- `createParticleSystem(count, spread, size, opacity, color)` - Create stars
- `createTorusRing(config)` - Create torus ring
- `createWireframeShape(config, index)` - Create wireframe shape
- `createHeroShape()` - Create hero focal shape
- `createSatelliteShapes()` - Create satellite shapes

**Example:**
```javascript
const stars = createParticleSystem(3200, 300, 0.055, 0.15, null);
scene.add(stars);
```

---

### 📄 three/animator.js
**Purpose:** Animation controller class

**Class:** `SceneAnimator`

**Methods:**
- `addRings(rings)` - Add rings to animate
- `addShapes(shapes)` - Add shapes to animate
- `addStars(violet, cyan, green)` - Add star layers
- `addHero(hero)` - Add hero shape
- `updateMouse(x, y)` - Update mouse position
- `animate()` - Main animation loop
- `start()` - Start animation
- `stop()` - Stop animation
- `handleResize()` - Handle window resize

**Example:**
```javascript
const animator = new SceneAnimator(scene, camera, renderer);
animator.addRings(rings);
animator.start();
```

---

## 🎬 GSAP Structure

### 📄 animations/index.js
**Purpose:** Animation manager and GSAP loader

**Exports:**
- `AnimationManager` class - Manages all animations
- `loadGSAP()` - Load GSAP from CDN
- `useAnimations()` - React hook

**Usage:**
```javascript
import { useAnimations } from './animations';

function Component() {
  useAnimations();
  return <div>...</div>;
}
```

---

### 📄 animations/gsapConfig.js
**Purpose:** Animation configuration and presets

**Exports:**
- `GSAP_CDN` - CDN URLs
- `TIMING` - Timing presets (fast, normal, slow)
- `EASING` - Easing presets (smooth, bounce, elastic)
- `FADE_UP` - Fade up animation config
- `FADE_IN` - Fade in animation config
- `SCALE_IN` - Scale in animation config
- `SLIDE_LEFT` - Slide left animation config
- `SLIDE_RIGHT` - Slide right animation config
- `SCROLL_TRIGGER_DEFAULTS` - Default scroll trigger settings

**Example:**
```javascript
import { EASING, FADE_UP } from './gsapConfig';

gsap.fromTo('.element', FADE_UP.from, {
  ...FADE_UP.to,
  ease: EASING.bounce
});
```

---

### 📄 animations/heroAnimations.js
**Purpose:** Hero section animations

**Exports:**
- `animateHero(gsap)` - Animate hero section

**Animates:**
- Hero tag
- Hero subtitle
- Hero buttons
- Hero badges
- Hero right panel
- Float badges

**Example:**
```javascript
import { animateHero } from './heroAnimations';

animateHero(gsap);
```

---

### 📄 animations/navbarAnimations.js
**Purpose:** Navbar animations

**Exports:**
- `animateNavbar(gsap)` - Animate navbar

**Animates:**
- Navbar container
- Navbar inner
- Nav links (staggered)
- Status indicator
- CTA button
- Avatar
- Progress bar

**Example:**
```javascript
import { animateNavbar } from './navbarAnimations';

animateNavbar(gsap);
```

---

### 📄 animations/scrollAnimations.js
**Purpose:** Scroll-triggered animations

**Exports:**
- `setupScrollAnimations(gsap)` - Setup all scroll animations
- `cleanupScrollTriggers()` - Cleanup scroll triggers

**Animates:**
- Stats section
- Feature cards
- Marquee
- Testimonials
- CTA section
- Login section
- Footer

**Example:**
```javascript
import { setupScrollAnimations, cleanupScrollTriggers } from './scrollAnimations';

setupScrollAnimations(gsap);

// On cleanup
cleanupScrollTriggers();
```

---

## 🔄 Data Flow

### Three.js Flow
```
ThreeBackground (index.js)
    ↓
    ├─→ config.js (loads configurations)
    ├─→ scene.js (creates objects)
    └─→ animator.js (animates objects)
```

### GSAP Flow
```
AnimationManager (index.js)
    ↓
    ├─→ gsapConfig.js (loads presets)
    ├─→ heroAnimations.js (hero animations)
    ├─→ navbarAnimations.js (navbar animations)
    └─→ scrollAnimations.js (scroll animations)
```

---

## 💡 Usage Examples

### Using Three.js Background

```javascript
import { useThreeBackground } from './three';

function AdminLanding() {
  const bgRef = useRef(null);
  
  useEffect(() => {
    const cleanup = useThreeBackground(bgRef);
    return cleanup;
  }, []);
  
  return (
    <div>
      <canvas ref={bgRef} style={{position:'fixed',inset:0,zIndex:0}} />
      {/* Rest of content */}
    </div>
  );
}
```

---

### Using GSAP Animations

```javascript
import { useAnimations } from './animations';

function AdminLanding() {
  useEffect(() => {
    const cleanup = useAnimations();
    return cleanup;
  }, []);
  
  return <div>{/* Content */}</div>;
}
```

---

### Custom Animation with Presets

```javascript
import { loadGSAP } from './animations';
import { EASING, TIMING } from './animations/gsapConfig';

loadGSAP().then(gsap => {
  gsap.fromTo('.custom-element',
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: TIMING.normal,
      ease: EASING.smooth
    }
  );
});
```

---

## 🎯 Benefits of This Structure

### Three.js Benefits

✅ **Modular Configuration**
- Easy to adjust particle counts
- Simple color changes
- Quick animation speed tweaks

✅ **Reusable Functions**
- Create objects anywhere
- Consistent object creation
- Easy testing

✅ **Organized Animation**
- Separate animation logic
- Clean animation loop
- Easy to extend

✅ **Better Performance**
- Optimized animation loop
- Proper cleanup
- Memory management

---

### GSAP Benefits

✅ **Centralized Config**
- Consistent timing
- Reusable easing
- Standard presets

✅ **Organized by Section**
- Easy to find animations
- Modify specific sections
- Add new animations

✅ **Easy Maintenance**
- Update one file
- Consistent animations
- Clear structure

✅ **Better Performance**
- Lazy loading
- Proper cleanup
- ScrollTrigger optimization

---

## 🔧 Customization Guide

### Modify Three.js Scene

**Change particle count:**
```javascript
// Edit three/config.js
export const STAR_LAYERS = [
  { name: 'white', count: 5000, ... }, // Increase from 3200
];
```

**Change colors:**
```javascript
// Edit three/config.js
export const TORUS_RINGS = [
  { col: 0xff0000, ... }, // Change to red
];
```

**Add new shape:**
```javascript
// Edit three/scene.js
export function createNewShape() {
  // Your shape logic
}

// Edit three/index.js
addNewShapes() {
  const shape = createNewShape();
  this.scene.add(shape);
}
```

---

### Modify GSAP Animations

**Change timing:**
```javascript
// Edit animations/gsapConfig.js
export const TIMING = {
  fast: 0.2,    // Faster
  normal: 0.5,
  slow: 1.0,    // Slower
};
```

**Add new animation:**
```javascript
// Create animations/newSectionAnimations.js
export function animateNewSection(gsap) {
  gsap.fromTo('.new-section', ...);
}

// Import in animations/index.js
import { animateNewSection } from './newSectionAnimations';
```

**Modify scroll trigger:**
```javascript
// Edit animations/scrollAnimations.js
scrollTrigger: {
  trigger: '.my-section',
  start: 'top 60%',  // Trigger earlier
  end: 'bottom 20%',
  scrub: true        // Add scrub
}
```

---

## 📊 File Statistics

| Category | Files | Lines | Purpose |
|----------|-------|-------|---------|
| Three.js | 4 | 600+ | 3D Background |
| GSAP | 5 | 400+ | Animations |
| **Total** | **9** | **1000+** | **Complete system** |

---

## 🚀 Performance Tips

### Three.js
- Reduce particle counts for mobile
- Use lower pixel ratio on low-end devices
- Disable animations on battery save mode

### GSAP
- Use `will-change` CSS property
- Batch DOM reads/writes
- Use ScrollTrigger's `scrub` for smooth scrolling
- Cleanup triggers on unmount

---

## 📚 Documentation

Each file has:
- ✅ Clear purpose comment
- ✅ Function documentation
- ✅ Usage examples
- ✅ Export descriptions

---

## ✨ Summary

### What You Have

1. **Organized Three.js** ✅
   - Separate config, scene, animator
   - Easy to customize
   - Clean structure

2. **Organized GSAP** ✅
   - Separate animations by section
   - Reusable presets
   - Easy to extend

3. **Complete Documentation** ✅
   - Usage examples
   - Customization guide
   - Performance tips

---

**Status: PRODUCTION READY** 🚀

Both Three.js and GSAP fully organized and documented!
